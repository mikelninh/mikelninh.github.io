"""Add two small entry links without replacing the existing homepage.

Build-time only: this script never commits or pushes. It refuses an unexpected
homepage structure rather than silently rewriting unrelated content.
"""
from __future__ import annotations

from pathlib import Path

NAV_ANCHOR = '<a href="culture/">Culture ↗</a>'
NAV_LINK = '<a href="beyond-cv/">Beyond CV</a>'
HERO_ANCHOR = '<a class="btn text" href="cv.html">Open CV ↗</a>'
HERO_LINK = '<a class="btn text" href="beyond-cv/">Beyond the CV ↗</a>'


def integrate(html: str) -> str:
    for anchor, addition in ((NAV_ANCHOR, NAV_LINK), (HERO_ANCHOR, HERO_LINK)):
        if addition in html:
            continue
        if html.count(anchor) != 1:
            raise ValueError(f"Homepage integration anchor changed: {anchor}")
        html = html.replace(anchor, anchor + addition, 1)
    return html


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    if not (root / 'beyond-cv/index.html').is_file():
        raise SystemExit('Beyond CV page is missing; refusing to add broken links.')
    page = root / 'index.html'
    original = page.read_text(encoding='utf-8')
    result = integrate(original)
    if result != original:
        page.write_text(result, encoding='utf-8')
    print('Beyond CV navigation ready; all other homepage content preserved.')


if __name__ == '__main__':
    main()
