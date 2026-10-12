# THE MAKING OF · GOOD QUESTION Studio Diary

**Status:** Draft PR; publisher approval pending. The main Slow Edition stays live and unchanged until approval.

A standalone trilingual (EN / DE / VI) founder essay in `index.html`, with all editorial copy embedded and transparently labelled as AI-assisted. No external front-end dependencies or scripts; optional typography loads from Google Fonts, with system fallbacks. Fully readable without JavaScript in English; DE/VI displayed via lightweight language controls when JavaScript is enabled. Translations require human/native-language review.

**What it documents:** The actual AI newsroom roles (QUILL/PROOF/ATELIER), limits of agent autonomy, evidence quality vs QA, live products already built, what has not been done, the finite Slow Feed and WUNDERPOST's four-page preview, and honest metrics only.

## Why this is a blog and not another company

One series inside GOOD QUESTION, not another product. The first post has a permanent URL: `/good-question/slow/studio/`; future dated entries should live under `studio/YYYY-MM-DD-topic/`, with a calm, finite index. Monthly is an aspiration, not an obligation.

Every future post should include: publication date, what actually shipped, dated source/commit, a failure or correction, the role of AI vs human, any measured cost or outcome, and one next action. If nothing meaningful changed, skip the month.

## Quality gate

```sh
python3 good-question/slow/studio/qa_blog.py
python3 good-question/newsroom/check_content.py
python3 good-question/slow/qa_slow.py
```

Technical tests cannot approve first-person truth, journalistic claims, expert status or native-language correctness. Human publisher must explicitly review and approve the PR before public release. After approval: add post to Slow Edition RSS, newsletter teaser and release notes; gather reader feedback without tracking or fake testimonials.

Our current Slow Edition article at `../?story=newsroom&lang=en` remains the introductory version; this page is the longer journal entry.
