# OUT OF PANEL · 0.7 — real-device release pass

**Automated browser viewport tests are not real hardware tests.** Before calling this fully mobile-verified, test on at least one Android Chrome phone and one iPhone Safari phone, preferably older hardware as well.

## Two-minute visitor test
1. Open https://mikelninh.github.io/beyond-cv/out-of-panel/ over a normal mobile connection. No account, wallet or purchase.
2. Is the coin visible immediately? Can you rotate it without accidentally scrolling the page?
3. Tap **Give it a spin**. Is the motion smooth and does the coin settle, without teleporting?
4. Tap **Look inside**. Does the camera arrive at the rooftop with no black frame, flicker, crash or overheating?
5. Select **Meet Mia**, then **Back to the coin**. Does the character/camera respond gently?
6. Open **Play** and place a piece. Open **Read** and turn one page.
7. Open **Pass it on**, copy the invitation, open it in an incognito/private window; does the recipient greeting appear?
8. Open **How did it feel?** and submit feedback only if you intend to send it; no email is required.
9. Turn on Reduced Motion in OS accessibility settings and repeat portal entry. Repeat once with battery saver mode.

## Report
Use **How did it feel?** on the public site, or email the project owner. Specify phone model, browser/version if known, which step failed, and whether sound or reduced motion was enabled. Avoid sending screenshots containing personal information.

## Release criteria
- No critical crashes, invisible primary actions, stuck gestures or horizontal overflow.
- Input follows the user's hand; release/cancel does not inject accidental turns.
- Static fallback still opens the game and comic when advanced rendering is unavailable.
- The private listening room requires a verified owner session.
- The feedback dialog never claims success without a successful server response.

## Evidence boundaries
GitHub Actions tests Chromium with SwiftShader WebGL2. Browser emulation does **not** measure native GPU speed, thermal throttling or real phone battery usage. The WebM/MP4 teaser is recorded from the real app, not an AI-generated depiction.
