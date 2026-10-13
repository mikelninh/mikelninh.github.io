#!/usr/bin/env python3
"""Download a narrowly scoped, real-only TED tender feed for BIDPILOT.

Stdlib only. Runs on GitHub Actions; always fails closed on total API failure.
No random/demo/fabricated notices. Relevance happens in the browser, separately.
"""
from __future__ import annotations

import datetime as dt
import json
import os
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
    "deadline-receipt-tender-date-lot", "total-value", "total-value-cur",
]
OUT = Path(__file__).with_name("notices.json")
NOTICE_ID = re.compile(r"^[0-9]{1,8}-[0-9]{4}$")


def first(value):
    """Unwrap TED multilingual dictionaries, arrays and lot-specific structures."""
    if value is None:
        return ""
    if isinstance(value, (str, int, float)):
        return str(value)
    if isinstance(value, list):
        for item in value:
            v = first(item)
            if v:
                return v
        return ""
    if isinstance(value, dict):
        for key in ("eng", "deu", "en", "ger"):
            if key in value:
                v = first(value[key])
                if v:
                    return v
        for item in value.values():
            v = first(item)
            if v:
                return v
    return ""


def as_codes(value):
    if isinstance(value, (str, int)):
        return [str(value)]
    if isinstance(value, list):
        values = []
        for item in value:
            values.extend(as_codes(item))
        return list(dict.fromkeys(values))[:8]
    if isinstance(value, dict):
        values = []
        for item in value.values():
            values.extend(as_codes(item))
        return list(dict.fromkeys(values))[:8]
    return []


def normalise(row):
    if not isinstance(row, dict):
        return None
    number = first(row.get("publication-number") or row.get("publicationNumber"))
    if not NOTICE_ID.fullmatch(number):
        return None
    title = first(row.get("notice-title") or row.get("noticeTitle"))
    if len(title.strip()) < 3:
        return None
    raw_deadline = first(row.get("deadline-receipt-tender-date-lot") or row.get("deadline"))
    result = {
        "id": number,
        "title": title.strip()[:500],
        "buyer": first(row.get("buyer-name"))[:200],
        "buyer_country": first(row.get("buyer-country")).upper()[:3],
        "published": first(row.get("publication-date"))[:10],
        "deadline": raw_deadline[:10] if re.match(r"\d{4}-\d{2}-\d{2}", raw_deadline) else "",
        "cpv": [x for x in as_codes(row.get("classification-cpv")) if re.match(r"^\d{8}", x)][:8],
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
    payload = {
        "query": query,
        "fields": FIELDS,
        "page": 1,
        "limit": 100,
        "scope": "ACTIVE",
        "paginationMode": "PAGE_NUMBER",
    }
    request = Request(
        BASE,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json",
                 "User-Agent": "BIDPILOT/1.0 (source: github.com/mikelninh/mikelninh.github.io)"},
        method="POST",
    )
    with open_url(request, timeout=35) as response:
        obj = json.load(response)
    if not isinstance(obj, dict):
        raise ValueError("Unexpected TED response type")
    records = obj.get("notices")
    if records is None:
        records = obj.get("results")
    if not isinstance(records, list):
        raise ValueError("Missing notices array: TED response schema changed")
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
        time.sleep(0.5)
    if successful == 0:
        raise RuntimeError("All TED queries failed; refusing to overwrite existing feed. " + "; ".join(errors))
    sorted_notices = sorted(found.values(), key=lambda row: row["published"], reverse=True)
    return {
        "schema": 1,
        "source": "TED Search API v3 / api.ted.europa.eu",
        "fetched_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "coverage": "Germany-focused IT/AI/software queries, last 60 days, 100 per query, active TED scope",
        "successful_queries": successful,
        "queries": list(queries.keys()),
        "errors": errors,
        "notices": sorted_notices[:300],
    }


def main():
    data = build_feed()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(data['notices'])} genuine notices; {data['successful_queries']}/3 queries succeeded.")
    if data["errors"]:
        print("Partial refresh issues: " + "; ".join(data["errors"]), file=sys.stderr)


if __name__ == "__main__":
    main()
