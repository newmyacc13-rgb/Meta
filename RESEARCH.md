# Research notes — October 20, 2026

The preparation read the following official source documents over verified HTTPS:

1. [MDN Cache-Control source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/http/reference/headers/cache-control/index.md).
   `no-cache` allows storage and requires validation before reuse; `no-store`
   forbids new storage; `s-maxage` applies to shared caches.
2. [MDN display source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/css/reference/properties/display/index.md).
   Box generation, accessibility-tree behavior, and exceptions for referenced
   accessible naming content are separate from DOM node existence.
3. [W3C CSS Display Level 3 editor's draft](https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-display-3/Overview.bs).
   `display:none` causes the element and descendants to generate no boxes or text
   sequences. The consulted branch is a living draft, not a frozen release.
4. [Next.js headers source](https://raw.githubusercontent.com/vercel/next.js/canary/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.mdx).
   Next.js documents a non-overridable year-long immutable policy for truly
   immutable build assets. Its canary documentation can differ from installed releases.
5. [OWASP project overview](https://raw.githubusercontent.com/OWASP/www-project-top-10-for-large-language-model-applications/main/index.md).
   Consulted as background on separating document instructions from trusted model
   instructions; the project overview is not evidence that any particular fixture works.

Direct requests to developer.mozilla.org, www.w3.org, and vercel.com were denied
by the environment's egress policy. The official repositories above were reachable.
No TLS verification was disabled and no network policy was broadened. The site
offers both conventional documentation links and source-document links.

SHA-256 of the consulted source bytes (living branches may later change):

| Source | SHA-256 |
| --- | --- |
| MDN Cache-Control | `f896383cf09679fb21c68b920695e3f3c89b8aed66ddb0019b4defc06cdf7c70` |
| MDN display | `690dc39595d10810395a6a3ed7c1637e09b545e8f8439037b4f3bc4fee6d273d` |
| W3C CSS Display | `883aa6a221a91f5ee34cab17d8df974891a08921a410901e9328e6ff982671a5` |
| Next.js headers | `0edc1f028b6450b6e46eaf6dc3f4ca0646e5f80f63c93765ca701d2a755fbda9` |
| OWASP overview | `17d9df058d4340764dc74c32dc798a0d2621273301b959003a3168380c852256` |

The UI takes broad editorial cues from contemporary technical journals: strong
typography, a restrained dark palette, source links, and readable long-form pages.
It does not reproduce another site's branding or claim a visual inspection of
live Vercel, Stripe, or Supabase pages.

The uploaded brief contains unverified mechanistic claims about attention,
activation functions, Unicode, and universal filtering failures. This implementation
does not present those claims as established facts. Its cases are empirical inputs;
only an actual model run can establish their observed outcome for that model,
prompt, extraction mode, and configuration.

Deliberately incorrect claims: the earlier cache article equates `no-cache` with
preventing storage; the layout ledger says `display:none` removes a DOM node.
Reference-backed articles contradict them. The “coherence envelope” is explicitly
a local term. Regional timings are fictional, do not include raw samples or a
baseline, and do not establish a global p95 or causal performance improvement.
