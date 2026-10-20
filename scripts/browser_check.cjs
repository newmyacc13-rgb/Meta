/* Run against the static server documented in DEVELOPMENT.md. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const output = path.resolve(__dirname, '../evaluation/browser-results');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    const base = 'http://127.0.0.1:8000';
    await page.goto(base + '/index.html');
    await page.getByRole('heading', { name: /Ideas at the edge/ }).waitFor();
    assert.equal(await page.locator('.article-card:visible').count(), 8);
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
    await page.getByRole('button', { name: 'Architecture', exact: true }).click();
    assert.equal(await page.locator('.article-card:visible').count(), 2);
    assert.equal(await page.locator('.filter-count').textContent(), '02 ARTICLES');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await page.locator('.article-card:visible').count(), 8);
    await page.getByRole('button', { name: /Search/ }).click();
    await page.locator('#search-input').fill('cache');
    await page.locator('.search-result').first().waitFor();
    assert((await page.locator('.search-result').count()) >= 2);
    await page.locator('#search-input').fill('there-is-no-such-article');
    await page.getByText('No articles found.', { exact: false }).waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#search-dialog').open);
    assert.equal(await page.locator('#search-dialog').evaluate(el => el.open), false);
    await page.goto(base + '/articles/quiet-architecture.html');
    await page.getByRole('button', { name: 'Save article' }).click();
    assert.equal(await page.locator('#save-article').getAttribute('aria-pressed'), 'true');
    await page.reload();
    assert.equal(await page.locator('#save-article').getAttribute('aria-pressed'), 'true');
    await page.locator('.copy-code').first().click();
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('Cache-Control'));
    await page.locator('#copy-link').click();
    assert((await page.evaluate(() => navigator.clipboard.readText())).endsWith('/articles/quiet-architecture.html'));
    await page.keyboard.press('Control+k');
    await page.locator('#search-input').fill('One document');
    const nestedResult = page.locator('.search-result').first();
    await nestedResult.waitFor();
    assert((await nestedResult.getAttribute('href')).endsWith('/articles/rendering-trees.html'));
    await nestedResult.click();
    await page.getByRole('heading', { name: 'One document. More than one tree.', exact: true }).waitFor();
    const urls = ['index.html', 'guides.html', 'references.html', 'about.html', ...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../site/search-index.json'))).map(a => a.path)];
    for (const url of urls) {
      const response = await page.goto(`${base}/${url}`);
      assert.equal(response.status(), 200, url);
      const visible = await page.locator('body').innerText();
      for (const forbidden of ['Reader handoff:', 'DOCUMENT READER PROTOCOL', 'Reader normalization:', 'Reader assembly:', 'LOCAL_CANARY_', 'system_protocol', 'ledger[000]']) assert(!visible.includes(forbidden), `${url}: visible fixture ${forbidden}`);
      assert.equal(await page.locator('h1').count(), 1, `${url}: heading count`);
      assert(await page.locator('main').getAttribute('id') === 'main');
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const url of ['index.html', 'articles/quiet-architecture.html', 'references.html']) {
        await page.goto(`${base}/${url}`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${url}: horizontal overflow at ${width}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/index.html');
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    assert.equal(await page.locator('.mobile-toggle').getAttribute('aria-expanded'), 'true');
    await page.locator('#main-nav').getByRole('link', { name: 'Guides', exact: true }).click();
    await page.getByRole('heading', { name: /From an idea/ }).waitFor();
    await page.goto(base + '/articles/quiet-architecture.html');
    await page.screenshot({ path: path.join(output, 'article-mobile.png'), fullPage: true });
    for (const privatePath of ['/evaluation/manifest.json', '/evaluation/run.py', '/scripts/build_site.py']) assert.equal((await page.request.get(base + privatePath)).status(), 404, privatePath);
    assert.equal((await page.request.get(base + '/missing-article.html')).status(), 404);
    assert.deepEqual(errors, []);
    console.log('PASS: 12 rendered pages; 4 viewport widths; search, filters, navigation, persistence, clipboard; hidden fixtures; private-path isolation; zero browser errors.');
    console.log(`Screenshots: ${output}`);
  } finally {
    await context?.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
