#!/usr/bin/env python3
"""BIDPILOT v1.1: source-linked, bounded TED ingestion. No invented notices."""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = "https://api.ted.europa.eu/v3/notices/search"
FIELDS = [
    "publication-number", "notice-title", "buyer-name", "buyer-country",
    "publication-date", "classification-cpv", "notice-type",
    "deadline-receipt-tender-date-lot",
    "deadline-receipt-request-date-lot", "total-value", "total-value-cur",
]
OUT = Path(__file__).with_name("notices.json")
NOTICE_ID = re.compile(r"^[0-9]{1,8}-[0-9]{4}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}")
PAGE_SIZE = 100
MAX_PAGES = 3

COMPETITION = {
    "cn-standard", "cn-social", "cn-desg", "pin-cfc-standard",
    "pin-cfc-social", "qu-sy", "subco",
}
PLANNING = {"pin-only", "pin-rtl", "pin-buyer", "pin-tran", "pmc"}
RESULT = {"can-standard", "can-social", "can-desg", "can-modif", "can-tran", "compl"}
OTHER = {"veat"}


def first(value):
    """Unwrap TED multilingual dictionaries, arrays and lot-specific structures."""
    if value is None:
        return ""
    if isinstance(value, (str, int, float)):
        return str(value)
    if isinstance(value, list):
        for item in value:
            answer = first(item)
            if answer:
                return answer
        return ""
    if isinstance(value, dict):
        for key in ("eng", "deu", "en", "ger"):
            if key in value:
                answer = first(value[key])
                if answer:
                    return answer
        for item in value.values():
            answer = first(item)
            if answer:
                return answer
    return ""


def as_codes(value):
    if isinstance(value, (str, int)):
        return [str(value)]
    if isinstance(value, list):
        values = []
        for item in value:
            values.extend(as_codes(item))
        return list(dict.fromkeys(values))[:30]
    if isinstance(value, dict):
        values = []
        for item in value.values():
            values.extend(as_codes(item))
        return list(dict.fromkeys(values))[:30]
    return []


def classify(notice_type):
    code = notice_type.lower().strip()
    if code in COMPETITION:
        return "competition"
    if code in PLANNING:
        return "planning"
    if code in RESULT:
        return "result"
    if code in OTHER:
        return "other"
    return "unknown"  # Never interpret missing fields as an open tender.


def deadlines_from(raw, kind):
    """Preserve independently stated deadlines; don't invent a missing deadline."""
    result = []
    def visit(obj, lot=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                visit(value, key if re.match(r"^(LOT|PAR)-", str(key)) else lot)
        elif isinstance(obj, list):
            for item in obj:
                visit(item, lot)
        elif isinstance(obj, str) and DATE.match(obj):
            day = obj[:10]
            try:
                dt.date.fromisoformat(day)
            except ValueError:
                return
            result.append({"date": day, "kind": kind, "lot": lot})
    visit(raw)
    unique = {(x["date"], x["kind"], x["lot"]): x for x in result}
    return sorted(unique.values(), key=lambda x: (x["date"], x["lot"]))[:30]


def normalise(row):
    if not isinstance(row, dict):
        return None
    number = first(row.get("publication-number") or row.get("publicationNumber"))
    if not NOTICE_ID.fullmatch(number):
        return None
    title = first(row.get("notice-title") or row.get("noticeTitle"))
    if len(title.strip()) < 3:
        return None
    code = first(row.get("notice-type")).lower().strip()
    tender = deadlines_from(row.get("deadline-receipt-tender-date-lot"), "tender")
    request = deadlines_from(row.get("deadline-receipt-request-date-lot"), "participation")
    deadlines = sorted(tender + request, key=lambda x: (x["date"], x["kind"], x["lot"]))
    raw_old = first(row.get("deadline"))
    if not deadlines and DATE.match(raw_old):
        deadlines = deadlines_from(raw_old, "unspecified")
    result = {
        "id": number,
        "title": title.strip()[:500],
        "buyer": first(row.get("buyer-name"))[:200],
        "buyer_country": first(row.get("buyer-country")).upper()[:3],
        "published": first(row.get("publication-date"))[:10],
        "notice_type": code[:60],
        "stage": classify(code),
        "deadline": deadlines[0]["date"] if deadlines else "",
        "deadlines": deadlines,
        "cpv": [x for x in as_codes(row.get("classification-cpv"))
                if re.fullmatch(r"\d{8}", x)][:8],
        "value": first(row.get("total-value"))[:30],
        "currency": first(row.get("total-value-cur"))[:10],
        "url": f"https://ted.europa.eu/en/notice/-/detail/{number}",
    }
    return result


def get_queries(today):
    since = (today - dt.timedelta(days=60)).strftime("%Y%m%d")
    return {
        "IT services": f"buyer-country=DEU AND classification-cpv=72000000 AND publication-date>={since} SORT BY publication-date DESC",
        "Software products": f"buyer-country=DEU AND classification-cpv=48000000 AND publication-date>={since} SORT BY publication-date DESC",
        "AI keyword": f'buyer-country=DEU AND FT~"artificial intelligence" AND publication-date>={since} SORT BY publication-date DESC',
    }


def retrieve(query, *, open_url=urlopen):
    """Bounded paging. Fail a query on malformed/failed pages; never pad with demo data."""
    records = []
    for page in range(1, MAX_PAGES + 1):
        payload = {
            "query": query, "fields": FIELDS, "page": page,
            "limit": PAGE_SIZE, "scope": "ACTIVE",
            "paginationMode": "PAGE_NUMBER",
        }
        request = Request(
            BASE,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json",
                     "User-Agent": "BIDPILOT/1.1 (github.com/mikelninh/mikelninh.github.io)"},
            method="POST",
        )
        with open_url(request, timeout=35) as response:
            obj = json.load(response)
        if not isinstance(obj, dict):
            raise ValueError("Unexpected TED response type")
        batch = obj.get("notices")
        if batch is None:
            batch = obj.get("results")
        if not isinstance(batch, list):
            raise ValueError("Missing notices array: TED response schema changed")
        records.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        time.sleep(0.3)
    return records


def build_feed(today=None, retrieve_fn=retrieve):
    today = today or dt.date.today()
    queries = get_queries(today)
    found, errors = {}, []
    successful = 0
    for label, query in queries.items():
        try:
            records = retrieve_fn(query)
            successful += 1
            for item in records:
                notice = normalise(item)
                if notice is not None:
                    found[notice["id"]] = notice
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as exc:
            errors.append(f"{label}: {str(exc)[:200]}")
        time.sleep(0.3)
    if successful == 0:
        raise RuntimeError("All TED queries failed; refusing to overwrite existing feed. " + "; ".join(errors))
    sorted_notices = sorted(found.values(), key=lambda row: row["published"], reverse=True)
    return {
        "schema": 2,
        "source": "TED Search API v3 / api.ted.europa.eu",
        "fetched_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "coverage": "German IT/software/AI shortlist, last 60 days; up to 300 per query; active TED scope; not exhaustive",
        "successful_queries": successful,
        "queries": list(queries.keys()),
        "errors": errors,
        "notices": sorted_notices,
    }


def main():
    data = build_feed()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(data['notices'])} verified source-linked notices; "
          f"{data['successful_queries']}/3 queries succeeded.", flush=True)
    if data["errors"]:
        print("Partial refresh issues: " + "; ".join(data["errors"]), file=sys.stderr)


if __name__ == "__main__":
    main()
