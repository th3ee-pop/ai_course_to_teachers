/* cycle.js —— 循环图组件（纯前端，无依赖，非 ES module）
   用法：<div class="cycle" data-nodes="观察|预测|操作|解释|记录"
              data-on="1" data-center="课堂实施" data-size="520"></div>
   接口：window.Cycle = { render(el), setActive(el,i), play(el,ms), stop(el) } */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var CSS = [
    '.cycle{display:inline-block;line-height:0;font-family:var(--font-sans)}',
    '.cycle svg{display:block;overflow:visible}',
    '.cy-node{cursor:pointer;transition:opacity .35s ease}',
    '.cy-node.off{opacity:.42}',
    '.cy-disc{fill:#fff;stroke:var(--accent);stroke-width:1.5;',
    'transition:fill .35s ease,stroke .35s ease}',
    '.dark .cy-disc{fill:var(--dark-band);stroke:var(--light-blue)}',
    '.cy-label{font-family:var(--font-sans);font-size:30px;fill:var(--text);',
    'transition:fill .35s ease}',
    '.dark .cy-label{fill:var(--dark-text)}',
    '.cy-node.on .cy-disc{fill:var(--accent);stroke:var(--accent)}',
    '.dark .cy-node.on .cy-disc{fill:var(--accent);stroke:var(--light-blue)}',
    '.cy-node.on .cy-label{fill:#fff}',
    '.cy-arc{fill:none;stroke:var(--accent);stroke-width:1.5}',
    '.cy-head{fill:var(--accent);stroke:none}',
    '.dark .cy-arc{stroke:var(--light-blue)}',
    '.dark .cy-head{fill:var(--light-blue)}',
    '.cy-center{font-family:var(--font-sans);font-size:32px;font-weight:500;',
    'fill:var(--accent-dark)}',
    '.dark .cy-center{fill:var(--light-blue)}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('cycle-css')) return;
    var s = document.createElement('style');
    s.id = 'cycle-css';
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  function el2(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    }
    return n;
  }
  function rad(d) { return d * Math.PI / 180; }
  function px(cx, cy, r, a) { return [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]; }
  function f(v) { return Math.round(v * 100) / 100; }

  /* ── 渲染 ────────────────────────────────────────────── */
  function render(el) {
    if (!el || el.nodeType !== 1) return el;
    injectCSS();
    stop(el);
    el.classList.add('cycle');

    var raw = String(el.getAttribute('data-nodes') || '');
    var names = raw.split(/[|｜]/).map(function (s) { return s.replace(/^[\s　]+|[\s　]+$/g, ''); })
                   .filter(function (s) { return s.length > 0; });
    if (names.length < 2) { el.innerHTML = ''; return el; }

    var n = names.length;
    var size = parseInt(el.getAttribute('data-size'), 10);
    if (!size || size < 160) size = 520;
    var centerText = String(el.getAttribute('data-center') || '').replace(/^[\s　]+|[\s　]+$/g, '');

    var c = size / 2;
    var longest = 2;
    for (var i = 0; i < n; i++) longest = Math.max(longest, names[i].length);
    var nodeR = Math.min(longest * 15 + 17, size * 0.19);
    var ringR = c - nodeR - 12;
    var maxR = ringR * Math.sin(Math.PI / n) - 9;
    if (nodeR > maxR) { nodeR = Math.max(22, maxR); ringR = c - nodeR - 12; }

    var svg = el2('svg', {
      viewBox: '0 0 ' + size + ' ' + size,
      width: size, height: size,
      xmlns: NS, 'aria-hidden': 'false'
    });

    /* 弧形箭头（顺时针，位于两节点之间的空隙中） */
    var halfNode = Math.asin(Math.min(0.98, nodeR / ringR)) * 180 / Math.PI;
    var step = 360 / n;
    var padA = Math.min(7, Math.max(2, (step - 2 * halfNode) * 0.18));
    var gArcs = el2('g', { 'class': 'cy-arcs' });
    for (i = 0; i < n; i++) {
      var base = -90 + i * step;
      var a1 = base + halfNode + padA;
      var a2 = base + step - halfNode - padA;
      if (a2 - a1 < 3) continue;
      var p1 = px(c, c, ringR, a1), p2 = px(c, c, ringR, a2);
      gArcs.appendChild(el2('path', {
        'class': 'cy-arc',
        d: 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' A' + f(ringR) + ' ' + f(ringR) +
           ' 0 0 1 ' + f(p2[0]) + ' ' + f(p2[1])
      }));
      /* 箭头：终点处沿顺时针切线方向 */
      var tx = -Math.sin(rad(a2)), ty = Math.cos(rad(a2));
      var nx = -ty, ny = tx, L = 13, W = 5.5;
      gArcs.appendChild(el2('path', {
        'class': 'cy-head',
        d: 'M' + f(p2[0] + tx * L) + ' ' + f(p2[1] + ty * L) +
           ' L' + f(p2[0] + nx * W) + ' ' + f(p2[1] + ny * W) +
           ' L' + f(p2[0] - nx * W) + ' ' + f(p2[1] - ny * W) + ' Z'
      }));
    }
    svg.appendChild(gArcs);

    /* 节点 */
    for (i = 0; i < n; i++) {
      var a = -90 + i * step;
      var p = px(c, c, ringR, a);
      var g = el2('g', { 'class': 'cy-node', 'data-i': i });
      g.appendChild(el2('circle', { 'class': 'cy-disc', cx: f(p[0]), cy: f(p[1]), r: f(nodeR) }));
      var t = el2('text', {
        'class': 'cy-label', x: f(p[0]), y: f(p[1]), dy: '.35em',
        'text-anchor': 'middle', 'font-size': '30'
      });
      t.appendChild(document.createTextNode(names[i]));
      g.appendChild(t);
      (function (idx) {
        g.addEventListener('click', function () { stop(el); setActive(el, idx); });
      })(i);
      svg.appendChild(g);
    }

    /* 圆心文字 */
    if (centerText) {
      var ct = el2('text', {
        'class': 'cy-center', x: f(c), y: f(c), dy: '.35em',
        'text-anchor': 'middle', 'font-size': '32'
      });
      ct.appendChild(document.createTextNode(centerText));
      svg.appendChild(ct);
    }

    el.innerHTML = '';
    el.appendChild(svg);
    el.style.width = size + 'px';
    el.setAttribute('data-cycle-rendered', '1');
    apply(el);
    return el;
  }

  function count(el) { return el.querySelectorAll('.cy-node').length; }

  function apply(el) {
    var raw = el.getAttribute('data-on');
    var on = (raw === null || raw === '') ? -1 : parseInt(raw, 10);
    if (isNaN(on)) on = -1;
    var nodes = el.querySelectorAll('.cy-node');
    for (var i = 0; i < nodes.length; i++) {
      var idx = parseInt(nodes[i].getAttribute('data-i'), 10);
      nodes[i].classList.toggle('on', on >= 0 && idx === on);
      nodes[i].classList.toggle('off', on >= 0 && idx !== on);
    }
    return el;
  }

  function setActive(el, i) {
    if (!el || el.nodeType !== 1) return el;
    if (!el.getAttribute('data-cycle-rendered')) render(el);
    var n = count(el);
    if (n > 0 && typeof i === 'number' && i >= 0) i = ((i % n) + n) % n;
    el.setAttribute('data-on', (i === null || i === undefined || i < 0) ? '' : String(i));
    return apply(el);
  }

  function play(el, ms) {
    if (!el || el.nodeType !== 1) return el;
    if (!el.getAttribute('data-cycle-rendered')) render(el);
    stop(el);
    var n = count(el);
    if (!n) return el;
    var cur = parseInt(el.getAttribute('data-on'), 10);
    if (isNaN(cur) || cur < 0) { cur = 0; setActive(el, 0); }
    var period = (typeof ms === 'number' && ms > 120) ? ms : 1400;
    el.__cycleTimer = setInterval(function () {
      cur = (cur + 1) % n;
      setActive(el, cur);
    }, period);
    return el;
  }

  function stop(el) {
    if (el && el.__cycleTimer) { clearInterval(el.__cycleTimer); el.__cycleTimer = null; }
    return el;
  }

  function all() {
    var list = Array.prototype.slice.call(document.querySelectorAll('.cycle'));
    for (var i = 0; i < list.length; i++) {
      if (!list[i].getAttribute('data-cycle-rendered')) render(list[i]);
    }
    return list;
  }

  window.Cycle = { render: render, setActive: setActive, play: play, stop: stop, all: all };

  injectCSS();
  all();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', all);
  }
})();
