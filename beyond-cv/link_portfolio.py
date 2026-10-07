"""Build-only, reversible additions. Never commits or pushes source changes."""
from pathlib import Path

BRIDGE = '''<section id="work-proof" class="recruiter" aria-labelledby="work-proof-title">
<div><div class="kicker">From curiosity to something you can inspect</div><h2 id="work-proof-title" style="margin-top:18px">What I care about.<br><em>What I build.</em></h2></div>
<div><p><strong>Semantic City — what a city needs to know before it acts.</strong> An independent prototype connecting climate, neighbourhood, green-space and hospital evidence for one Berlin example.</p><p>It makes the sources and the missing information visible. It does not claim to rank whole cities or allocate resources automatically.</p><div class="buttons"><a class="button" href="./dksr/" lang="de">Fallstudie für DKSR prüfen ↗</a><a class="button outline" href="https://mikelninh.github.io/cv.html">Open CV ↗</a></div><p class="small">AI-assisted development. A stored example, not live conditions. Follow the evidence and see the limits in the case study.</p></div>
</section>
'''
PERSONAL_ANCHOR = '<section id="hello" class="recruiter"'
HOME_ANCHOR = '<a href="#method">How I build</a><a href="culture/">Culture ↗</a>'
HOME_LINK = '<a href="beyond-cv/atelier/">Beyond CV</a>'


def integrate_personal(html: str) -> str:
    if 'id="work-proof"' in html:
        if BRIDGE not in html:
            raise ValueError('Work bridge has been edited; review rather than overwrite.')
        return html
    for marker in (PERSONAL_ANCHOR, 'id="gift-prompt"', 'id="builder"', 'id="human"'):
        if html.count(marker) != 1:
            raise ValueError(f'Original Beyond CV contract changed: {marker}')
    return html.replace(PERSONAL_ANCHOR, BRIDGE + PERSONAL_ANCHOR, 1)


def integrate_home(html: str) -> str:
    if any(link in html for link in ('href="beyond-cv/"', 'href="/beyond-cv/"', 'href="beyond-cv/atelier/"', 'href="/beyond-cv/atelier/"')):
        return html
    if html.count(HOME_ANCHOR) != 1:
        raise ValueError('Portfolio navigation changed; refusing an unreviewed rewrite.')
    return html.replace(HOME_ANCHOR, HOME_ANCHOR + HOME_LINK, 1)


def build(root: Path) -> None:
    if not (root / 'beyond-cv/dksr/index.html').is_file():
        raise ValueError('DKSR case is missing.')
    for path, transform in ((root / 'beyond-cv/index.html', integrate_personal), (root / 'index.html', integrate_home)):
        original = path.read_text(encoding='utf-8')
        result = transform(original)
        if result != original:
            path.write_text(result, encoding='utf-8')
    print('Beyond CV bridge built; original personal copy, gift and builder preserved.')


if __name__ == '__main__':
    build(Path(__file__).resolve().parents[1])
