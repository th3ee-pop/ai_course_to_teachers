/* map334.js —— 3＋3＋4 总图组件（纯前端，无依赖，非 ES module）。由 map334.js 改造：
   顺序改为 三类能力 → 三问 → 四环节；能力与三问的表述按 v0.3 脚本。
   用法：<div class="map334" data-stage="课堂实施" data-caps="内容生成,角色扮演"
              data-show="caps,questions,stages" data-reveal="1" data-size="full"></div>
   接口：window.Map334 = { render(el), set(el,{stage,caps}), all() }
   说明：三问与三类能力不构成一一对应，组件内不画任何连线、不用同色暗示对应关系。 */
(function () {
  'use strict';

  var STAGES = [
    { name: '教学设计',   alias: ['教学设计', '设计'] },
    { name: '课堂实施',   alias: ['课堂实施', '实施'] },
    { name: '教学评价',   alias: ['教学评价', '评价'] },
    { name: '教师专业发展', alias: ['教师专业发展', '专业发展', '发展'] }
  ];

  var ROLES = [
    { key: '内容生成', pre: '', kw: '内容生成', alias: ['生成', '工具'] },
    { key: '连通管道', pre: '', kw: '连通管道', alias: ['管道', '连通'] },
    { key: '角色扮演', pre: '', kw: '角色扮演', alias: ['扮演', '角色', '主体'] }
  ];

  var QUESTIONS = ['要解决什么问题（目标设定）', '最终成功标准是什么（验收标准）', '如何让AI理解以上两点（上下文构建）'];

  var TAG_STAGES = '4环节';
  var TAG_ROLES = '3类能力';
  var TAG_QS = '3问';
  var LOOP_TEXT = '进入下一轮';

  /* ── 样式：注入一次，不需要改模板 ─────────────────────── */
  var CSS = [
    '.map334{box-sizing:border-box;width:100%;display:flex;flex-direction:column;',
    'font-family:var(--font-sans);color:inherit}',
    '.map334 *{box-sizing:border-box}',
    '.map334.m334-full{min-height:620px;gap:40px;justify-content:space-between}',
    '.map334.m334-compact{min-height:300px;gap:26px;justify-content:flex-start}',
    '.m334-row{min-width:0}',
    '.m334-tag{font-family:var(--font-cond);font-weight:500;font-size:24px;',
    'letter-spacing:.14em;color:var(--accent);margin-bottom:18px}',
    '.dark .m334-tag{color:var(--light-blue)}',

    /* 4 环节：横向流程 + 回环 */
    '.m334-flow{display:flex;align-items:stretch}',
    '.m334-stage{flex:1 1 0;min-width:0;padding:34px 18px;border:1px solid var(--accent);',
    'text-align:center;font-size:36px;font-weight:500;line-height:1.3;',
    'transition:background .35s ease,color .35s ease,opacity .35s ease,border-color .35s ease}',
    '.m334-stage.m334-wide{flex:1.5 1 0}',
    '.m334-stage.on{background:var(--accent);color:#fff;border-color:var(--accent)}',
    '.m334-stage.off{opacity:.42}',
    '.m334-arr{flex:0 0 44px;display:flex;align-items:center;justify-content:center;',
    'color:var(--accent);font-size:30px;line-height:1}',
    '.dark .m334-arr{color:var(--light-blue-2)}',
    '.m334-loop{position:relative;height:54px;margin-top:2px}',
    '.m334-loop-line{position:absolute;left:30px;right:30px;top:0;height:30px;',
    'border:1px solid var(--accent);border-top:0}',
    '.dark .m334-loop-line{border-color:var(--accent)}',
    '.m334-loop-line::before{content:"";position:absolute;left:-5px;top:-1px;width:9px;height:9px;',
    'border-top:1px solid var(--accent);border-left:1px solid var(--accent);transform:rotate(45deg)}',
    '.m334-loop-text{position:absolute;left:50%;top:30px;transform:translate(-50%,-50%);',
    'padding:0 18px;background:var(--bg);font-size:24px;letter-spacing:.06em;color:var(--accent);',
    'white-space:nowrap}',
    '.dark .m334-loop-text{background:var(--dark);color:var(--light-blue)}',
    '.m334-compact .m334-stage{padding:24px 16px;font-size:34px}',
    '.m334-compact .m334-loop{height:44px}',
    '.m334-compact .m334-loop-line{height:22px}',
    '.m334-compact .m334-loop-text{top:22px}',

    /* 3 角色：一行三格 */
    '.m334-roles{display:flex;background:var(--surface)}',
    '.dark .m334-roles{background:var(--dark-band)}',
    '.m334-role{flex:1 1 0;min-width:0;padding:30px 28px;font-size:32px;line-height:1.5;',
    'text-align:center;transition:opacity .35s ease,background .35s ease,color .35s ease}',
    '.m334-role+.m334-role{border-left:1px solid var(--divider)}',
    '.dark .m334-role+.m334-role{border-left-color:var(--accent-dark)}',
    '.m334-role b{font-weight:500;color:var(--accent-dark)}',
    '.dark .m334-role b{color:var(--light-blue-3)}',
    '.m334-role.on{background:rgba(89,128,166,.16)}',
    '.dark .m334-role.on{background:#33526e}',
    '.m334-role.off{opacity:.42}',

    /* 3 问：编号 01 02 03 */
    '.m334-qs{display:flex;gap:36px}',
    '.m334-q{flex:1 1 0;min-width:0;display:flex;gap:18px;align-items:baseline;',
    'font-size:28px;line-height:1.45}',
    '.m334-q .m334-n{flex:0 0 auto;font-family:var(--font-cond);font-weight:500;',
    'letter-spacing:.1em;color:var(--accent)}',
    '.dark .m334-q .m334-n{color:var(--light-blue-2)}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('map334-css')) return;
    var s = document.createElement('style');
    s.id = 'map334-css';
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── 小工具 ──────────────────────────────────────────── */
  function norm(v) {
    return String(v == null ? '' : v).replace(/[\s　]+/g, '');
  }
  function splitList(v) {
    return String(v == null ? '' : v).split(/[,，、|]/).map(norm).filter(Boolean);
  }
  function matchStage(v) {
    var k = norm(v);
    if (!k) return -1;
    for (var i = 0; i < STAGES.length; i++) {
      if (STAGES[i].alias.indexOf(k) >= 0) return i;
    }
    for (i = 0; i < STAGES.length; i++) {
      if (STAGES[i].name.indexOf(k) >= 0) return i;
    }
    return -1;
  }
  function matchRoles(v) {
    var want = splitList(v), hit = [];
    for (var i = 0; i < ROLES.length; i++) {
      for (var j = 0; j < want.length; j++) {
        var w = want[j];
        if (w === ROLES[i].key || w.indexOf(ROLES[i].kw) >= 0 || ROLES[i].alias.indexOf(w) >= 0) {
          hit.push(i); break;
        }
      }
    }
    return hit;
  }
  function parseShow(v) {
    var out = { stages: true, roles: true, questions: true };
    var list = splitList(v);
    if (!list.length) return out;
    out.stages = out.roles = out.questions = false;
    for (var i = 0; i < list.length; i++) {
      var k = list[i].toLowerCase();
      if (k === 'stages' || k === 'stage' || k === '环节') out.stages = true;
      else if (k === 'roles' || k === 'role' || k === 'caps' || k === 'cap' || k === '能力' || k === '角色') out.roles = true;
      else if (k === 'questions' || k === 'question' || k === '问' || k === '三问') out.questions = true;
    }
    if (!out.stages && !out.roles && !out.questions) out.stages = out.roles = out.questions = true;
    return out;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ── 结构 ────────────────────────────────────────────── */
  function rowOpen(kind, rev) {
    return '<div class="m334-row m334-' + kind + (rev ? ' reveal' : '') + '">';
  }
  function stagesHTML(rev) {
    var h = rowOpen('stages', rev) + '<div class="m334-tag">' + TAG_STAGES + '</div><div class="m334-flow">';
    for (var i = 0; i < STAGES.length; i++) {
      if (i) h += '<div class="m334-arr">&#8594;</div>';
      h += '<div class="m334-stage' + (i === STAGES.length - 1 ? ' m334-wide' : '') +
           '" data-i="' + i + '">' + STAGES[i].name + '</div>';
    }
    h += '</div><div class="m334-loop"><span class="m334-loop-line"></span>' +
         '<span class="m334-loop-text">' + LOOP_TEXT + '</span></div></div>';
    return h;
  }
  function rolesHTML(rev) {
    var h = rowOpen('rolesrow', rev) + '<div class="m334-tag">' + TAG_ROLES + '</div><div class="m334-roles">';
    for (var i = 0; i < ROLES.length; i++) {
      h += '<p class="m334-role" data-i="' + i + '">' + ROLES[i].pre + '<b>' + ROLES[i].kw + '</b></p>';
    }
    return h + '</div></div>';
  }
  function questionsHTML(rev) {
    var h = rowOpen('questions', rev) + '<div class="m334-tag">' + TAG_QS + '</div><div class="m334-qs">';
    for (var i = 0; i < QUESTIONS.length; i++) {
      h += '<p class="m334-q"><span class="m334-n">' + pad2(i + 1) + '</span><span>' + QUESTIONS[i] + '</span></p>';
    }
    return h + '</div></div>';
  }

  /* ── 高亮 ────────────────────────────────────────────── */
  function apply(el) {
    var si = matchStage(el.getAttribute('data-stage'));
    var stageEls = el.querySelectorAll('.m334-stage'), i, idx;
    for (i = 0; i < stageEls.length; i++) {
      idx = parseInt(stageEls[i].getAttribute('data-i'), 10);
      stageEls[i].classList.toggle('on', si >= 0 && idx === si);
      stageEls[i].classList.toggle('off', si >= 0 && idx !== si);
    }
    var hit = matchRoles(el.getAttribute('data-caps') || el.getAttribute('data-roles'));
    var roleEls = el.querySelectorAll('.m334-role');
    for (i = 0; i < roleEls.length; i++) {
      idx = parseInt(roleEls[i].getAttribute('data-i'), 10);
      roleEls[i].classList.toggle('on', hit.length > 0 && hit.indexOf(idx) >= 0);
      roleEls[i].classList.toggle('off', hit.length > 0 && hit.indexOf(idx) < 0);
    }
    return el;
  }

  /* ── 渲染 ────────────────────────────────────────────── */
  function render(el) {
    if (!el || el.nodeType !== 1) return el;
    injectCSS();
    var size = norm(el.getAttribute('data-size')).toLowerCase();
    if (size !== 'compact') size = 'full';
    el.classList.add('map334');
    el.classList.toggle('m334-full', size === 'full');
    el.classList.toggle('m334-compact', size === 'compact');

    var show = parseShow(el.getAttribute('data-show'));
    var rev = norm(el.getAttribute('data-reveal')) === '1';
    var h = '';
    if (show.roles) h += rolesHTML(rev);
    if (show.questions) h += questionsHTML(rev);
    if (show.stages) h += stagesHTML(rev);
    el.innerHTML = h;
    el.setAttribute('data-map334-rendered', '1');
    return apply(el);
  }

  function set(el, opt) {
    if (!el || el.nodeType !== 1) return el;
    opt = opt || {};
    if (!el.getAttribute('data-map334-rendered')) render(el);
    if ('stage' in opt) el.setAttribute('data-stage', opt.stage == null ? '' : String(opt.stage));
    if ('caps' in opt || 'roles' in opt) {
      var r = 'caps' in opt ? opt.caps : opt.roles;
      if (r == null) r = '';
      else if (Object.prototype.toString.call(r) === '[object Array]') r = r.join(',');
      el.setAttribute('data-caps', String(r));
    }
    return apply(el);
  }

  function all() {
    var list = Array.prototype.slice.call(document.querySelectorAll('.map334'));
    for (var i = 0; i < list.length; i++) {
      if (!list[i].getAttribute('data-map334-rendered')) render(list[i]);
    }
    return list;
  }

  window.Map334 = { render: render, set: set, all: all };

  injectCSS();
  all();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', all);
  }
})();
