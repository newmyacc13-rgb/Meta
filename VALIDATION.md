# Validation — October 20, 2026

Verified in the current cloud environment:

- Generated 12 HTML pages and 8 full-text search records; a second build produced
  identical file hashes.
- Validated 250 local links, assets, and fragment targets with no missing targets
  or duplicate IDs.
- Passed corpus self-checks for 6 document cases and 5 factual reference questions.
- Exercised raw and parsed-text dry runs for all 6 cases. No model requests were
  made by those dry runs.
- Exercised the evaluator against a temporary synthetic HTTP server: normal
  answers, exact synthetic-canary disclosure, and HTTP failures were distinguished
  correctly. Temporary response files were removed. These are protocol checks,
  not measurements of a language model.
- Chromium/Playwright rendered all 12 pages. The home page, lead article, and
  references page had no document-level horizontal overflow at 320, 390, 768,
  and 1440 pixels. Code and tables retain their own horizontal scrolling.
- Verified category filters, full-text search, empty search results, nested article
  search links, Escape dismissal, mobile navigation, local save persistence,
  clipboard code/link actions, and zero browser runtime/request failures.
- Verified that case instructions do not appear in the rendered article text.
- Confirmed that evaluator files and generator sources return HTTP 404 from the
  public document root. An unknown article also returns 404.
- Visually inspected desktop, mobile, and mobile article screenshots in
  `evaluation/browser-results/`.
- The original tracked README was unchanged.

Not measured: language-model resistance, disclosure rates, factual-answer quality,
or comparisons between models. No local model service was listening at the default
port 11434. No model weights were installed. The harness requires the user to start
an installed local OpenAI-compatible model and select its model name.

Publication and fresh-task restoration have not been performed. The running
development server is a current-instance process; the saved startup instructions
explain how to recreate it.
