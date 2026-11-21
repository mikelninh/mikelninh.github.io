#!/usr/bin/env python3
"""LifeBench official German legislative monitor. Stdlib-only, evidence-first.

Failure is explicit. A Bundestag vote never implies promulgation. Promulgation
never implies a particular entry-into-force date or measured societal effect.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

DIP_BASE = "https://search.dip.bundestag.de/api/v1"
DIP_KEY = os.getenv("DIP_API_KEY") or "R2BZaee.DjdCyihKZMf8AOjtScubP2EVydegzjmBIQ"  # official public temporary key, valid to May 2027; secret overrides it
RSS_URL = "https://www.recht.bund.de/rss/feeds/rss_bgbl-1.xml"
GII_URL = "https://www.gesetze-im-internet.de/aktuDienst-rss-feed.xml"
GITHUB_ISSUES = "https://api.github.com/repos/mikelninh/mikelninh.github.io/issues?state=all&per_page=100"
PINNED_ID = "334563"
GITHUB_REPO = "mikelninh/mikelninh.github.io"
KEYWORDS = ("tierschutz", "tierhalt", "schlacht", "landwirtschaft", "pflanzen", "klima", "umwelt", "energie", "künstliche intelligenz", "algorithm", "digital", "reparatur", "transparenz", "demokratie", "verbraucher", "nachhaltigkeit")
SOURCE_LINKS = {
    "dip": "https://dip.bundestag.de/",
    "gazette": "https://www.recht.bund.de/",
    "gii": "https://www.gesetze-im-internet.de/aktuDienst.html",
}
USER_AGENT = "LifeBenchLawMonitor/1.0 (https://mikelninh.github.io/firstlight-lab/; public-interest read-only)"


def now_utc():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def fetch_bytes(url: str, *, dip=False, github=False, attempts=2) -> bytes:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json" if (dip or github) else "application/xml"}
    if dip:
        headers["Authorization"] = "ApiKey " + DIP_KEY
    if github and os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=12) as response:
                return response.read(3_000_000)
        except Exception as e:
            if attempt == attempts-1:
                raise RuntimeError(f"Could not fetch {url.split('?')[0]}: {type(e).__name__}: {e}") from e
            time.sleep(1.3 * (attempt + 1))
    raise AssertionError("unreachable")


def get_json(url: str, *, dip=False, github=False):
    return json.loads(fetch_bytes(url, dip=dip, github=github).decode("utf-8"))


def source_date(raw):
    if not raw or not isinstance(raw, str):
        return ""
    return raw[:10]


def clean_text(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(s or ""))).strip()


def official_ref(case_id):
    return f"https://dip.bundestag.de/vorgang/{case_id}"


def parse_gazette(payload: bytes):
    root = ET.fromstring(payload)
    result = []
    ns = "{http://recht.bund.de/rss/meta}"
    for item in root.findall("./channel/item"):
        def val(name):
            e = item.find(name)
            return clean_text(e.text if e is not None else "")
        url = val("link")
        if not url.startswith("https://www.recht.bund.de/"):
            continue
        result.append({"title": val("title"), "date": val("pubDate"), "url": url,
                       "citation": val(ns+"fundstelle"), "gesta": val(ns+"gesta"),
                       "kind": val(ns+"typ"), "subject": val(ns+"sachgebiet")})
    return result


def parse_gii(payload: bytes):
    root = ET.fromstring(payload)
    result = []
    for item in root.findall("./channel/item"):
        def val(name):
            e = item.find(name)
            return clean_text(e.text if e is not None else "")
        url = val("link")
        if url.startswith("https://www.recht.bund.de/"):
            result.append({"title": val("description"), "date": val("pubDate"), "url": url, "citation": val("title")})
    return result


def select_cases(documents, max_count=11):
    matches = [d for d in documents if d.get("vorgangstyp") == "Gesetzgebung" and any(k in clean_text(d.get("titel")).lower() for k in KEYWORDS)]
    matches.sort(key=lambda d: d.get("aktualisiert", ""), reverse=True)
    # Never mark a random similar case as the user-targeted law.
    return matches[:max_count]


def positions_from(dip_id, api_get):
    u = DIP_BASE+"/vorgangsposition?"+urllib.parse.urlencode({"f.vorgang": str(dip_id)})
    rows = api_get(u).get("documents", [])[:75]
    result = []
    for row in rows:
        result.append({"date": source_date(row.get("datum")), "house": {"BT":"Bundestag", "BR":"Bundesrat"}.get(row.get("zuordnung"), row.get("zuordnung", "Unbekannt")),
                       "event": clean_text(row.get("vorgangsposition", "Schritt")),
                       "source": official_ref(dip_id), "position_id": str(row.get("id", ""))})
    return sorted(result, key=lambda e: (e["date"], e["position_id"]))


def detect_stage(raw_status, gazette_link):
    s = clean_text(raw_status).lower()
    if gazette_link or "verkündet" in s:
        return "promulgated"
    if "verabschiedet" in s or "angenommen" in s:
        return "parliamentary_decision"
    if "beratung" in s or "überwiesen" in s or "ausschuss" in s:
        return "deliberation"
    if "eingebracht" in s or "einbringung" in s:
        return "introduced"
    return "status_unspecified"


def case_view(document, gazette, positions):
    dip_id = str(document.get("id"))
    gesta = clean_text(document.get("gesta", ""))
    # Exact GESTA identifier match. Never infer promulgation from similar words.
    notices = [x for x in gazette if gesta and x["gesta"].upper() == gesta.upper() and x["kind"].lower() == "gesetz"]
    notice = notices[0] if notices else None
    # DIP's own structured promulgation record, if provided, is also admissible.
    dp = document.get("verkuendung") or []
    promulgated = bool(notice or dp)
    return {
        "id": dip_id,
        "title": clean_text(document.get("titel")),
        "type": "official_legislative_procedure",
        "gesta": gesta,
        "status_raw": clean_text(document.get("beratungsstand")) or "Unbekannt",
        "stage": detect_stage(document.get("beratungsstand"), notice["url"] if notice else None),
        "source_updated_at": document.get("aktualisiert"),
        "source_date": source_date(document.get("datum")),
        "source_url": official_ref(dip_id),
        "positions": positions,
        "promulgation": {"verified": promulgated, "url": notice["url"] if notice else None, "citation": notice["citation"] if notice else None, "source": "BGBl GESTA exact match" if notice else ("DIP structured record" if dp else None)},
        "entry_into_force": {"verified": False, "date": None, "reason": "Full official legal text and commencement clause require independent verification"},
        "impact": {"verified": False, "reason": "No independently validated outcome series attached"},
    }


def parse_consultations(issues):
    entries = []
    for i in issues:
        if "pull_request" in i:
            continue
        title = clean_text(i.get("title", ""))
        if not title.startswith("[LifeBench]"):
            continue
        url = str(i.get("html_url", ""))
        if not url.startswith("https://github.com/mikelninh/mikelninh.github.io/issues/"):
            continue
        entries.append({"title": title[:180], "url": url, "state": i.get("state", "unknown"),
                        "created_at": i.get("created_at"), "comments": int(i.get("comments") or 0),
                        "number": i.get("number")})
    return {"count": len(entries), "open": sum(i["state"] == "open" for i in entries), "items": entries[:35],
            "note": "Public GitHub Issues. Counts do not measure public support or representativeness."}


def changes_between(old, current):
    past = {x["id"]: x for x in old.get("cases", [])}
    events = list(old.get("changes", []))[:65]
    for case in current["cases"]:
        prev = past.get(case["id"])
        if prev is None:
            if case["id"] != PINNED_ID:
                continue
            events.insert(0, {"id":case["id"],"type":"first_observation","at":current["generated_at"],"new":case["status_raw"],"source_url":case["source_url"]})
        elif prev.get("status_raw") != case["status_raw"] or prev.get("promulgation",{}).get("verified") != case["promulgation"]["verified"]:
            events.insert(0,{"id":case["id"],"type":"official_status_change","at":current["generated_at"],"old":prev.get("status_raw"),"new":case["status_raw"],"source_url":case["source_url"]})
    return events[:80]


def build(previous=None, api_get=None, rss=None, gii=None, issues=None):
    api_get = api_get or (lambda u: get_json(u,dip=True))
    gazette_health = "ok"
    gii_health = "ok"
    issues_health = "ok"
    if rss is None:
        try:
            rss = parse_gazette(fetch_bytes(RSS_URL, attempts=1))
        except (RuntimeError, ET.ParseError) as exc:
            print(f"WARN: Official BGBl feed unavailable: {type(exc).__name__}", file=sys.stderr)
            rss, gazette_health = [], "unavailable"
    if gii is None:
        try:
            gii = parse_gii(fetch_bytes(GII_URL, attempts=1))
        except (RuntimeError, ET.ParseError) as exc:
            print(f"WARN: Gesetze im Internet feed unavailable: {type(exc).__name__}", file=sys.stderr)
            gii, gii_health = [], "unavailable"
    if issues is None:
        try:
            issues = get_json(GITHUB_ISSUES, github=True)
        except RuntimeError as exc:
            print(f"WARN: Public consultations unavailable: {type(exc).__name__}", file=sys.stderr)
            issues, issues_health = [], "unavailable"
    # Public API supports cursor pagination. Limit 6 pages / 600 items for predictable load.
    u = DIP_BASE+"/vorgang?"+urllib.parse.urlencode({"f.wahlperiode":"21","f.vorgangstyp":"Gesetzgebung"})
    docs = []
    for _ in range(6):
        page = api_get(u)
        docs.extend(page.get("documents", []))
        cursor = page.get("cursor")
        if not cursor:
            break
        u = DIP_BASE+"/vorgang?"+urllib.parse.urlencode({"f.wahlperiode":"21","f.vorgangstyp":"Gesetzgebung","cursor":cursor})
    pinned = api_get(DIP_BASE+"/vorgang/"+PINNED_ID)
    chosen = [pinned]+[d for d in select_cases(docs) if str(d.get("id")) != PINNED_ID]
    cases = [case_view(d,rss,positions_from(d['id'],api_get)) for d in chosen]
    relevant = [x for x in rss if any(k in (x['title']+' '+x['subject']).lower() for k in KEYWORDS)][:35]
    current = {
        "schema":"lifebench-official-monitor-v1", "generated_at":now_utc(),
        "contract":"Observed official parliamentary records are not the same as promulgation, effective law or measured impact.",
        "sources": {"dip":{"status":"ok","url":SOURCE_LINKS['dip'],"count":len(docs),"checked_at":now_utc()},
                    "gazette":{"status":gazette_health,"url":SOURCE_LINKS['gazette'],"count":len(rss),"checked_at":now_utc()},
                    "gii":{"status":gii_health,"url":SOURCE_LINKS['gii'],"count":len(gii),"checked_at":now_utc()},
                    "consultations":{"status":issues_health,"url":"https://github.com/mikelninh/mikelninh.github.io/issues","checked_at":now_utc()}},
        "cases": cases,"gazette_related":relevant,"consultations":parse_consultations(issues),
        "changes": [],"outcome_status":"Unmeasured until independent data and a documented baseline exist",
        "last_verified_at":None,
    }
    current["changes"] = changes_between(previous or {}, current)
    return current


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out",required=True)
    parser.add_argument("--fixture",help="Offline fixture input with pre-supplied source results")
    args=parser.parse_args(argv)
    out=Path(args.out)
    prev=json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
    if args.fixture:
        fix=json.loads(Path(args.fixture).read_text(encoding="utf-8"))
        pages=fix['api']
        def mock(url):
            if '/vorgangsposition?' in url:return pages['positions']
            if '/vorgang/334563' in url:return pages['pinned']
            return pages['list']
        result=build(previous=prev,api_get=mock,rss=fix['gazette'],gii=fix['gii'],issues=fix['issues'])
    else:
        result=build(previous=prev)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding="utf-8")
    print(f"LifeBench: {len(result['cases'])} legislative records, {len(result['gazette_related'])} related gazette entries, {result['consultations']['count']} consultation issues; last updated {result['generated_at']}")

if __name__=='__main__':
    main()
