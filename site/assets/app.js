(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = (message) => {
    let node = $('.toast');
    if (!node) { node = document.createElement('div'); node.className = 'toast'; node.setAttribute('role', 'status'); document.body.append(node); }
    node.textContent = message;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.remove(), 2400);
  };
  const menu = $('.mobile-toggle');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    $('.nav').classList.toggle('open', open);
    menu.textContent = open ? 'Close' : 'Menu';
  });
  const dialog = $('#search-dialog');
  const input = $('#search-input');
  let entries;
  let loading;
  // Use an explicit asset URL: currentScript is null inside later event callbacks.
  const scriptRoot = new URL('../', document.currentScript.src);
  const indexURL = new URL('search-index.json', scriptRoot);
  const getEntries = () => {
    if (entries) return Promise.resolve(entries);
    return loading ||= fetch(indexURL).then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => entries = data).catch(() => { loading = null; throw new Error('Search could not load. Please try again.'); });
  };
  let searchVersion = 0;
  async function search() {
    const version = ++searchVersion;
    const results = $('#search-results');
    results.replaceChildren();
    try {
      const data = await getEntries();
      if (version !== searchVersion) return;
      const query = input.value.trim().toLowerCase();
      const hits = data.filter(item => `${item.title} ${item.description} ${item.category} ${item.text || ''}`.toLowerCase().includes(query));
      if (!hits.length) { results.textContent = 'No articles found. Try “cache” or “rendering”.'; return; }
      hits.forEach(item => {
        const link = document.createElement('a'); link.className = 'search-result'; link.href = new URL(item.path, scriptRoot).href;
        link.textContent = item.title;
        const meta = document.createElement('span'); meta.textContent = `${item.category} · ${item.minutes} min read`;
        link.append(meta); results.append(link);
      });
    } catch (error) { if (version === searchVersion) results.textContent = error.message; }
  }
  function openSearch() { if (!dialog.open) dialog.showModal(); input.focus(); search(); }
  $$('.search-button').forEach(button => button.addEventListener('click', openSearch));
  $('.close-search')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  input?.addEventListener('input', search);
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape' && dialog?.open) { event.preventDefault(); dialog.close(); }
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') menu.click();
  });
  const cards = $$('.article-card');
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    cards.forEach(card => { card.hidden = button.dataset.category !== 'All' && card.dataset.category !== button.dataset.category; if (!card.hidden) count++; });
    $('.filter-count').textContent = `${String(count).padStart(2, '0')} ARTICLES`;
  }));
  $$('pre').forEach(pre => {
    const code = $('code', pre); if (!code) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.textContent = 'Copy'; button.setAttribute('aria-label', 'Copy code');
    button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(code.textContent); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy', 1800); } catch { toast('Copy unavailable. Select the code to copy it.'); } });
    pre.append(button);
  });
  $('#copy-link')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('Article link copied'); } catch { toast('Copy the article URL from your address bar.'); } });
  const save = $('#save-article');
  if (save) {
    const key = `fieldnotes:saved:${location.pathname}`;
    const setSaved = saved => { save.setAttribute('aria-pressed', String(saved)); save.textContent = saved ? 'Saved ✓' : 'Save article'; };
    try { setSaved(localStorage.getItem(key) === 'true'); } catch { setSaved(false); }
    save.addEventListener('click', () => { const saved = save.getAttribute('aria-pressed') !== 'true'; try { localStorage.setItem(key, String(saved)); setSaved(saved); toast(saved ? 'Saved on this device' : 'Removed from saved articles'); } catch { toast('This browser cannot save articles.'); } });
  }
  const progress = $('.progress');
  if (progress) {
    const update = () => { const range = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${range > 0 ? Math.min(100, Math.max(0, scrollY / range * 100)) : 0}%`; };
    document.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(items => items.forEach(item => { if (item.isIntersecting) { $$('.toc a').forEach(a => a.classList.toggle('active', a.hash === `#${item.target.id}`)); } }), { rootMargin: '-10% 0px -70% 0px' });
      $$('.prose h2[id]').forEach(h => observer.observe(h));
    }
  }
})();
