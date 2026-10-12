#!/usr/bin/env python3
"""Dependency-free static editorial QA for the standalone founder's diary.

Verifies presentation wiring, trilingual structure, reproducible source links,
publication boundaries and JS syntax. NOT a human, language or scientific review.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import html.parser
import json
import re
import subprocess
import sys

P = Path(__file__).resolve().parent
ROOT = P.parents[2]
DOC = (P / "index.html").read_text(encoding="utf-8")
PASS = []
FAIL = []

def check(name, ok, note=""):
    (PASS if ok else FAIL).append(name + (": " + note if note else ""))
    print(("PASS" if ok else "FAIL") + " " + name + (" (" + note + ")" if note else ""))

m = re.search(r'<script id="story-data" type="application/json">(.*?)</script>', DOC, re.S)
check("Structured article data exists", m is not None)
if not m:
    sys.exit(1)
try:
    DATA = json.loads(m.group(1))
    check("Article JSON parses", True)
except (ValueError, TypeError) as e:
    check("Article JSON parses", False, str(e))
    sys.exit(1)
locales = ("en", "de", "vi")
check("All three languages present", set(locales) <= set(DATA))
for locale in locales:
    d = DATA.get(locale, {})
    parts = d.get("sections", [])
    check(locale + " five substantial chapters", len(parts) == 5 and all(
        len(x.get("paras", [])) >= 2 and len(" ".join(x.get("paras", []))) >= 120
        for x in parts
    ))
    check(locale + " stable chapter ids",
          [x.get("id") for x in parts] == ["experiment", "newsroom", "real", "missing", "next"])
    check(locale + " human accountability disclosure",
          "AI" in d.get("notice", "") and len(d.get("notice", "")) > 130)
    check(locale + " future and limitations stated",
          bool(d.get("closing")) and len(d.get("title", "")) > 15)
check("Open Studio has a canonical URL",
      'https://mikelninh.github.io/good-question/slow/studio/' in DOC)
check("Public evidence links present",
      all(s in DOC for s in ["QA_RESULTS.json", "EDITORIAL_CHARTER.md", "CODEX_HANDOFF.md", "BACKLOG.json"]))
check("Machine roles aren't passed off as experts",
      "not independent" in DATA["en"]["notice"].lower() or "not independent" in DOC.lower() or "not three continuously" in " ".join(DATA["en"]["sections"][1]["paras"]))
check("Pending editorial signoff visibly disclosed",
      "awaiting publisher sign-off" in DATA["en"]["read"])
check("No fake newsletter subscription",
      "there is no live email subscription" in DOC.lower())
check("No ad pixels, trackers or embedded checkout",
      not any(s in DOC.lower() for s in ["googletagmanager.com", "facebook.net", "stripe.js", "gtag("]))
check("Respect reduced motion",
      "prefers-reduced-motion" in DOC)
check("Mobile layout breakpoints", "@media(max-width:600px)" in DOC and "@media(max-width:850px)" in DOC)
check("Semantic article and language buttons",
      "<main " in DOC and "aria-pressed" in DOC and 'aria-label="Article language"' in DOC)
script = re.search(r'<script>\s*(\(function\(\).*?)</script>', DOC, re.S)
check("Article language JS exists", script is not None)
if script:
    try:
        p = subprocess.run(["node", "--check", "-"], input=script.group(1), text=True,
                           capture_output=True, timeout=12)
        check("Browser script syntax accepted by Node", p.returncode == 0, p.stderr[:240])
    except (OSError, subprocess.TimeoutExpired) as e:
        check("Browser script syntax accepted by Node", False, str(e))
check("English article has no duplicate lead", 
      DATA["en"]["sections"][0]["paras"][0] in DOC and
      DOC.count(DATA["en"]["sections"][0]["paras"][0]) == 1)

class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.hrefs.append(href)

links = Links()
links.feed(DOC)
missing = []
for url in links.hrefs:
    p = urlsplit(url)
    if p.scheme or url.startswith("#") or url.startswith("//"):
        continue
    check_path = (P / unquote(p.path)).resolve()
    if check_path.is_dir():
        check_path /= "index.html"
    if not check_path.is_file():
        missing.append(url)
check("All internal links exist in repository", not missing, str(missing[:10]))

print(f"\nTOTAL {len(PASS)}/{len(PASS)+len(FAIL)} passed")
if FAIL:
    print("FAILURES:", json.dumps(FAIL, ensure_ascii=False, indent=2))
sys.exit(bool(FAIL))
