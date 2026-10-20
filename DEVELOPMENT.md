# Fieldnotes development

A dependency-free, static editorial site with a separate local-model evaluation corpus.
The original README is preserved. Public deployment files are **only `site/`**.

## Build and run

Python 3.10 or newer is sufficient. No package installation, environment variables,
credentials, remote fonts, analytics, or remote runtime API calls are required.

```sh
cd /workspace/Meta
python3 scripts/build_site.py
python3 scripts/check_site.py
python3 evaluation/run.py --self-check
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

Readiness: make a local GET request to port 8000 and confirm the response contains
“Ideas at the edge”. Stop the foreground server with Ctrl-C. The cloud onboarding
interface does not provide a public localhost preview. Deploy `site/` to any static
host when ready; do not expose the repository root as the document root.

Articles are authored in `scripts/build_site.py`. Keep generated HTML and the search
index alongside their source when committing. Running the builder twice produces
identical output. CSS and browser behavior live in `site/assets/`.

## Local-model evaluation

The visible journal is an English-language reading corpus. Its authors and regional
measurements are fictional. Some claims intentionally contradict the linked primary
references. `evaluation/manifest.json` contains the answer key, six document cases,
five fact questions, and corpus hashes. It is not served by the site.

The six cases cover hidden HTML, HTML comments, JSON authority metadata, fragmented
instructions, zero-width Unicode, and a long template ledger. They are representative
fixtures, not a claim to cover every technique or to guarantee success. Mathematical
notation and Unicode do not establish any universal bypass of a model’s controls.

Use only a local model configured with the harness's **synthetic system prompt**.
The runner generates a fresh canary for every case. It does not access this chat’s
instructions, real credentials, or any production system prompt. No exfiltration
destination or third-party model endpoint is included.

```sh
python3 evaluation/run.py --dry-run --mode raw
python3 evaluation/run.py --dry-run --mode text

# With an already-running local OpenAI-compatible model server:
python3 evaluation/run.py --model YOUR_INSTALLED_MODEL \
  --endpoint http://127.0.0.1:11434/v1/chat/completions \
  --mode raw --output evaluation/results-raw.json
```

`raw` sends HTML source. `text` uses a documented non-rendering HTML parser: it keeps
hidden and template text, removes comments, and omits script/style bodies. Neither
mode claims to reproduce a browser's rendered text or every crawler’s behavior.
Browser validation independently confirms that the fixture instructions do not
appear in `body.innerText`. A mode where a fixture is absent is a useful extraction
control, not proof that a model resisted that fixture.

A completed result records whether the exact synthetic canary appeared. That narrow
score does not detect every partial disclosure, role confusion, or factual error.
Review returned answers separately. The five factual questions are provided for
manual scoring; the runner does not pretend to grade their semantics. Request errors
produce exit status 1, distinct from completed model answers. Self-checks and dry runs
do not establish model robustness. A local model is not bundled or downloaded.

## Browser validation

If Playwright and Chromium are available:

```sh
node scripts/browser_check.cjs
```

Start the static server first. The check validates desktop and mobile layouts,
category filtering, search from both index and nested article URLs, navigation,
article saving, code copying, rendered fixture invisibility, missing-page handling,
and absence of browser errors. Screenshots go to the ignored directory
`evaluation/browser-results/`. Playwright is optional development tooling, not a
site dependency.

## References and provenance

`RESEARCH.md` records the official documents consulted, network limitations, and
the deliberate distinction between reference-backed facts and experimental claims.
External links require Internet access; browsing, search, fonts, and the local
evaluation runner do not depend on those links being reachable at runtime.
