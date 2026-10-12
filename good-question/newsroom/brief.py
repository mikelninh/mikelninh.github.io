#!/usr/bin/env python3
"""Deterministic planning brief: creates no AI output and never publishes.
Default due cadence: every second Monday anchored 2026-10-12 (Berlin week start).
The GitHub Action runs weekly but skips non-due weeks. --force enables local/manual draft.
"""
import argparse
import datetime as dt
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ANCHOR=dt.date(2026,10,12)

def is_due(day):
    return day.weekday()==0 and (day-ANCHOR).days>=0 and ((day-ANCHOR).days % 14)==0

def render(day, forced=False):
    data=json.loads((HERE/'BACKLOG.json').read_text())
    items=data['items']
    ready=sorted((i for i in items if i['status'] in ('pitched','researching','sources_checked','draft','copy_edit','translation_review')),key=lambda i:(i['priority'],{'S':0,'M':1,'L':2}.get(i['size'],3),i['id']))
    rows=['# GOOD QUESTION — Editorial planning brief', '',f'**Cycle begins:** {day.isoformat()}  |  **Next review:** {(day+dt.timedelta(days=14)).isoformat()}  |  **Human publisher approval required**','', '> It won\'t and can\'t be perfect. One useful, honest thing at a time.','', '## Proposed four-page WUNDERPOST / next Slow Edition', '','These are proposals from a standing backlog, **not current or verified news**.', '']
    for idx,item in enumerate(ready[:4],1):
        rows+= [f"{idx}. **{item['title']}** ({item['id']}) — {item['type']} · {item['status']} · owner: {item['owner']}",f"   - Next: {item['next_action']}",f"   - Sources to obtain: {', '.join(item['sources_needed']) or 'No new empirical source claimed'}",'']
    rows += ['## One outcome to complete before writing more', '', f"**{ready[0]['id']} — {ready[0]['title']}**" if ready else 'Backlog needs new approved pitches.', '', '## QUILL / PROOF / ATELIER operating rhythm','', '- **QUILL:** pick one outcome, craft the reader promise, open a draft PR/issue and keep the 4-page letter tight.', '- **PROOF:** build claim–source map; find counterevidence; verify market-specific products; do not pretend to have completed expert review.', '- **ATELIER:** ship one delightful, accessible interaction and inspect 390px mobile.', '- **HUMAN:** decide angle, review sources and translations, approve or postpone release. Never default to approval.', '', '## Release gate', '', '- [ ] Four-page editorial outline is readable and has a coherent theme.', '- [ ] Claims have original-source URLs, scope, caveats and checked date.', '- [ ] Any interviews or taste tests have real provenance and consent.', '- [ ] DE/EN/VI status made explicit; English-first newsletter as previously agreed.', '- [ ] Product ingredient claims tied to exact market and SKU (especially Toomba).', '- [ ] Mobile/desktop and keyboard QA passed.', '- [ ] Sources and conflicts disclosed; affiliate recommendations separated from reporting.', '- [ ] **Human publisher approved.**', '- [ ] Publish intentionally and log corrections; no auto publication.', '', '## Selected backlog snapshot', '']
    for item in ready[:12]:rows.append(f"- `{item['id']}` [{item['status']}] {item['title']} — priority {item['priority']}, {item['size']}")
    rows += ['','---','*Generated deterministically from `BACKLOG.json`. No live research, interviews, product checks, or approvals performed by this script.*','']
    return '\n'.join(rows)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--force',action='store_true');ap.add_argument('--output',type=Path,default=None);ap.add_argument('--date',type=dt.date.fromisoformat,default=dt.date.today());args=ap.parse_args()
    if not (args.force or is_due(args.date)):
        print(f'SKIP: {args.date.isoformat()} is not an anchored fortnightly editorial planning Monday.')
        raise SystemExit(3)
    body=render(args.date,args.force)
    if args.output:args.output.write_text(body,encoding='utf-8');print(f'WROTE {args.output} ({len(body)} bytes)')
    else:print(body)

if __name__=='__main__':main()
