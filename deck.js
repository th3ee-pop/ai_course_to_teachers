/* 中小学教师AI培训 · 120页课件 · 运行脚本
   功能：翻页、分步呈现（.reveal）、目录（主线/备选分组）、全屏、讲者视图（独立窗口）、
   翻页停视频、iframe 按需加载/卸载、config.js 现场地址与二维码、页码/定位行开关、
   数字跳页、URL 锚点同步。互动内容（视频、输入框、链接、iframe）获得焦点时不拦截快捷键。
   URL 参数：?all 一次显示全部分步；?embed（讲者视图内的跟随预览）；?offset=1（下一页预览） */
(function () {
  'use strict';
  const TAG = 'ai-training-deck';
  const params = new URLSearchParams(location.search);
  const embed = params.has('embed');
  const offset = parseInt(params.get('offset') || '0', 10) || 0;
  const revealAll = params.has('all');
  const CFG = window.DECK_CONFIG || {};

  const stage = document.getElementById('stage');
  const slides = Array.from(stage.querySelectorAll('section.slide'));
  const total = slides.length;
  let index = 0;
  let presenterWin = null;

  /* ── 页面数据（供目录与讲者视图）────────────── */
  let mainCount = 0;
  const data = slides.map((s, i) => ({
    n: i + 1,
    num: (s.dataset.kind || '主线') === '备选' ? (s.dataset.id || '') : String(++mainCount).padStart(2, '0'),
    id: s.dataset.id || '',
    title: s.dataset.title || '',
    stage: s.dataset.stage || '',
    module: s.dataset.module || '',
    kind: s.dataset.kind || '主线',
    replaces: s.dataset.replaces || '',
    notes: (s.querySelector('.notes') || {}).textContent || '',
    resources: Array.from(s.querySelectorAll('.notes a')).map(a => ({ text: a.textContent, href: a.getAttribute('href') })),
    steps: 0
  }));

  /* ── 分步呈现 ──────────────────────────────────
     正文元素加 class="reveal"（可选 data-step="n" 让多个元素同一步出现）。
     → 先逐步显示，显示完再翻页；← 先逐步收回；?all 一次全显。 */
  function groups(slide) {
    const els = Array.from(slide.querySelectorAll('.reveal'));
    if (!els.length) return [];
    const map = new Map(); let auto = 0;
    els.forEach(el => {
      const k = el.dataset.step ? ('s' + el.dataset.step) : ('a' + (auto++));
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(el);
    });
    return Array.from(map.entries())
      .sort((a, b) => { const na = a[0][0] === 's' ? +a[0].slice(1) : 1000 + +a[0].slice(1); const nb = b[0][0] === 's' ? +b[0].slice(1) : 1000 + +b[0].slice(1); return na - nb; })
      .map(e => e[1]);
  }
  slides.forEach((s, i) => { data[i].steps = groups(s).length; });
  function stepOf(slide) { return parseInt(slide.dataset.rv || '0', 10) || 0; }
  function setStep(slide, n) {
    const g = groups(slide);
    n = Math.max(0, Math.min(g.length, n));
    slide.dataset.rv = String(n);
    g.forEach((els, k) => els.forEach(el => {
      el.classList.toggle('on', revealAll || k < n);
      el.classList.toggle('last', !revealAll && k === n - 1);
    }));
    slide.classList.toggle('all-on', revealAll || n >= g.length);
    return n;
  }

  /* ── 缩放 ──────────────────────────────────── */
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--scale', s);
  }
  window.addEventListener('resize', fit);
  fit();

  /* ── 媒体：翻页停视频、iframe 按需加载/卸载 ── */
  function pauseVideos() {
    slides.forEach((s, i) => {
      if (i === index) return;
      s.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) {} });
    });
  }
  function loadEmbeds(slide) {
    slide.querySelectorAll('.embed[data-src]').forEach(box => {
      if (box.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      f.src = box.dataset.src; f.setAttribute('allow', 'fullscreen; autoplay'); f.loading = 'eager';
      f.addEventListener('load', () => box.classList.add('loaded'));
      box.appendChild(f);
    });
  }
  function unloadEmbeds(slide) {
    slide.querySelectorAll('.embed[data-src] iframe').forEach(f => f.remove());
    slide.querySelectorAll('.embed.loaded').forEach(b => b.classList.remove('loaded'));
  }

  /* ── 现场配置（config.js）──────────────────── */
  function applyConfig() {
    document.querySelectorAll('[data-config]').forEach(el => {
      const key = el.dataset.config; const val = CFG[key];
      if (el.classList.contains('qr')) {
        el.innerHTML = '';
        if (val && window.qrcode) {
          try {
            const q = window.qrcode(0, 'M'); q.addData(val); q.make();
            el.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
            el.classList.add('ready');
          } catch (e) { el.textContent = '二维码生成失败'; }
        } else {
          el.innerHTML = '<span class="placeholder">' + (el.dataset.placeholder || '现场填写 config.js 后显示二维码') + '</span>';
        }
        return;
      }
      if (el.tagName === 'A') {
        if (val) { el.href = val; el.classList.remove('unset'); } else { el.removeAttribute('href'); el.classList.add('unset'); }
      }
      const u = el.querySelector('.url'); if (u) u.textContent = val || (el.dataset.placeholder || '地址现场填写');
      if (el.classList.contains('url')) el.textContent = val || (el.dataset.placeholder || '地址现场填写');
    });
  }

  /* ── 翻页 ──────────────────────────────────── */
  function show(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(total - 1, i));
    const prev = index;
    index = i;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (prev !== i) unloadEmbeds(slides[prev]);
    setStep(slides[i], opts.rv != null ? opts.rv : (opts.full ? groups(slides[i]).length : 0));
    loadEmbeds(slides[i]);
    pauseVideos();
    if (!embed) {
      const id = data[i].id || String(i + 1);
      if (('#' + id) !== location.hash) history.replaceState(null, '', '#' + id);
      document.title = `${id} ${data[i].title} · 中小学教师AI培训`;
      updateHud();
      markToc();
      broadcast();
    }
  }
  function updateHud() {
    const c = document.getElementById('hud-count'); if (!c) return;
    const st = data[index].steps ? ` · 步 ${stepOf(slides[index])}/${data[index].steps}` : '';
    c.textContent = `${index + 1} / ${total} · ${data[index].id}${st}`;
  }
  function step(d) {
    const s = slides[index]; const g = groups(s).length; const cur = stepOf(s);
    if (!revealAll && d > 0 && cur < g) { setStep(s, cur + 1); updateHud(); broadcast(); return; }
    if (!revealAll && d < 0 && cur > 0) { setStep(s, cur - 1); updateHud(); broadcast(); return; }
    if (d > 0 && index >= total - 1) return;
    if (d < 0 && index <= 0) return;
    show(index + d, { full: d < 0 });
  }
  function indexFromHash(h) {
    h = (h || '').replace(/^#/, '');
    if (!h) return 0;
    const byId = data.findIndex(d => d.id === h);
    if (byId >= 0) return byId;
    const n = parseInt(h, 10);
    return isNaN(n) ? 0 : n - 1;
  }

  /* ── 讲者视图通信 ──────────────────────────── */
  function state() { return { tag: TAG, type: 'state', index, total, rv: stepOf(slides[index]), steps: data[index].steps, slides: data }; }
  function broadcast() {
    if (presenterWin && !presenterWin.closed) {
      try { presenterWin.postMessage(state(), '*'); } catch (e) {}
    }
  }
  function openPresenter() {
    if (presenterWin && !presenterWin.closed) { presenterWin.focus(); broadcast(); return; }
    presenterWin = window.open('presenter.html', 'ai-training-presenter', 'width=1280,height=800');
  }
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.tag !== TAG) return;
    if (embed) {
      if (m.type === 'state') show(m.index + offset, offset === 0 ? { rv: m.rv } : { full: true });
      return;
    }
    if (m.type === 'ready') { presenterWin = e.source || presenterWin; broadcast(); }
    else if (m.type === 'goto') show(m.index);
    else if (m.type === 'step') step(m.delta);
  });

  /* ── 覆盖层：目录 / 帮助 ───────────────────── */
  /* 主线页右上角显示连续页码，备选页保留原 ID；data-id 仍用于定位 */
  slides.forEach((s, i) => { const el = s.querySelector('.hdr .pid'); if (el && data[i].kind !== '备选') el.textContent = data[i].num; });

  const toc = document.getElementById('toc');
  const help = document.getElementById('help');
  function buildToc() {
    if (!toc) return;
    const list = toc.querySelector('#toc-list');
    let lastModule = null, lastKind = null, html = '';
    data.forEach((d, i) => {
      if (d.kind !== lastKind) { html += `<div class="kind">${d.kind === '备选' ? '备选片段（按需替换主线对应片段，不叠加计时）' : '主线 96 页'}</div>`; lastKind = d.kind; lastModule = null; }
      if (d.module !== lastModule) { html += `<div class="module">${d.module}</div>`; lastModule = d.module; }
      const rep = d.replaces ? `<span class="rep">替换 ${d.replaces}</span>` : '';
      html += `<li data-i="${i}"><span class="id">${d.num}</span><span class="t">${d.title}${rep}</span><span class="st">${d.stage}${d.steps ? ' · ' + d.steps + '步' : ''}</span></li>`;
    });
    list.innerHTML = html;
    list.addEventListener('click', (e) => {
      const li = e.target.closest('li'); if (!li) return;
      show(parseInt(li.dataset.i, 10)); closeOverlays();
    });
    const h1 = toc.querySelector('h1'); if (h1) h1.textContent = `目录 · 共 ${total} 页`;
  }
  function markToc() {
    if (!toc) return;
    toc.querySelectorAll('li').forEach(li => li.classList.toggle('current', parseInt(li.dataset.i, 10) === index));
  }
  function toggle(el) { if (!el) return; const open = !el.classList.contains('open'); closeOverlays(); el.classList.toggle('open', open); }
  function closeOverlays() { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); }
  function anyOverlay() { return !!document.querySelector('.overlay.open'); }

  /* ── 全屏 ──────────────────────────────────── */
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  /* ── 当前页视频播放/暂停 ────────────────────── */
  function toggleVideo() {
    const v = slides[index].querySelector('video'); if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }

  /* ── 键盘 ──────────────────────────────────── */
  let jumpBuf = '', jumpTimer = null;
  const jumpEl = document.getElementById('jump');
  function showJump() {
    if (!jumpEl) return;
    jumpEl.textContent = jumpBuf ? ('→ ' + jumpBuf) : '';
    jumpEl.classList.toggle('show', !!jumpBuf);
    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { jumpBuf = ''; showJump(); }, 2500);
  }
  function isInteractive(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('input, textarea, select, button, a, video, audio, iframe, [contenteditable="true"], .anim[tabindex]');
  }
  function onKey(e) {
    if (embed) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isInteractive(e.target) && e.key !== 'Escape') return;
    const k = e.key;
    let handled = true;
    if (anyOverlay() && k !== 'Escape' && k !== 't' && k !== 'T' && k !== 'h' && k !== 'H' && k !== '?') return;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') step(1);
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace' || k === 'ArrowUp') step(-1);
    else if (k === 'Home') show(0);
    else if (k === 'End') show(total - 1);
    else if (k === 'f' || k === 'F') toggleFullscreen();
    else if (k === 't' || k === 'T') toggle(toc);
    else if (k === 'h' || k === 'H' || k === '?') toggle(help);
    else if (k === 'n' || k === 'N') openPresenter();
    else if (k === 'v' || k === 'V') toggleVideo();
    else if (k === 'a' || k === 'A') { setStep(slides[index], groups(slides[index]).length); updateHud(); broadcast(); }
    else if (k === 'i' || k === 'I') document.body.classList.toggle('hide-ids');
    else if (k === 'l' || k === 'L') document.body.classList.toggle('hide-locator');
    else if (k === 'k' || k === 'K') document.body.classList.toggle('hide-keyframes');
    else if (k === 'Escape') { if (anyOverlay()) closeOverlays(); else if (document.fullscreenElement) document.exitFullscreen(); else handled = false; }
    else if (/^[0-9]$/.test(k)) { jumpBuf = (jumpBuf + k).slice(0, 3); showJump(); }
    else if (k === 'Enter') { if (jumpBuf) { show(parseInt(jumpBuf, 10) - 1); jumpBuf = ''; showJump(); } else step(1); }
    else handled = false;
    if (handled) e.preventDefault();
  }
  window.addEventListener('keydown', onKey);

  /* ── 底部工具条（鼠标移动时出现）──────────── */
  let hudTimer = null;
  function pokeHud() {
    if (embed) return;
    document.body.classList.add('hud-visible');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => document.body.classList.remove('hud-visible'), 2500);
  }
  window.addEventListener('mousemove', pokeHud);
  const hud = document.getElementById('hud');
  if (hud) {
    hud.addEventListener('mouseenter', () => clearTimeout(hudTimer));
    hud.addEventListener('mouseleave', pokeHud);
    hud.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'prev') step(-1); else if (act === 'next') step(1);
      else if (act === 'toc') toggle(toc); else if (act === 'help') toggle(help);
      else if (act === 'presenter') openPresenter(); else if (act === 'fullscreen') toggleFullscreen();
      b.blur();
    });
  }
  document.querySelectorAll('.overlay [data-close]').forEach(b => b.addEventListener('click', closeOverlays));

  /* ── 其他事件 ──────────────────────────────── */
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideos(); });
  window.addEventListener('hashchange', () => { if (!embed) { const i = indexFromHash(location.hash); if (i !== index) show(i); } });
  window.addEventListener('beforeunload', () => { if (presenterWin && !presenterWin.closed) { try { presenterWin.postMessage({ tag: TAG, type: 'bye' }, '*'); } catch (e) {} } });

  /* ── 启动 ──────────────────────────────────── */
  applyConfig();
  if (revealAll) document.body.classList.add('reveal-all');
  if (embed) {
    document.body.classList.add('embed');
    ['hud', 'toc', 'help', 'jump'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
    show(offset, { full: offset > 0 });
  } else {
    buildToc();
    show(indexFromHash(location.hash));
  }
  window.deck = { show, step, data, setStep: (n) => { setStep(slides[index], n); updateHud(); broadcast(); }, get index() { return index; }, config: CFG };
})();
