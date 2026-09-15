/* map433.js —— 4＋3＋3 总图组件（纯前端，无依赖，非 ES module）
   用法：<div class="map433" data-stage="课堂实施" data-roles="工具,主体"
              data-show="stages,roles,questions" data-reveal="1" data-size="full"></div>
   接口：window.Map433 = { render(el), set(el,{stage,roles}), all() }
   说明：三问与三种角色不构成一一对应，组件内不画任何连线、不用同色暗示对应关系。 */
(function () {
  'use strict';

  var STAGES = [
    { name: '教学设计',   alias: ['教学设计', '设计'] },
    { name: '课堂实施',   alias: ['课堂实施', '实施'] },
    { name: '教学评价',   alias: ['教学评价', '评价'] },
    { name: '教师专业发展', alias: ['教师专业发展', '专业发展', '发展'] }
  ];

  var ROLES = [
    { key: '管道', pre: '信息加工整合的', kw: '管道' },
    { key: '工具', pre: '生成落地的',     kw: '工具' },
    { key: '主体', pre: '新的教育实践',   kw: '主体' }
  ];

  var QUESTIONS = ['我想得到什么', 'AI需要扮演什么角色', '能提供什么上下文'];

  var TAG_STAGES = '4环节';
  var TAG_ROLES = '3角色';
  var TAG_QS = '3问';
  var LOOP_TEXT = '进入下一轮';

  /* ── 样式：注入一次，不需要改模板 ─────────────────────── */
  var CSS = [
    '.map433{box-sizing:border-box;width:100%;display:flex;flex-direction:column;',
    'font-family:var(--font-sans);color:inherit}',
    '.map433 *{box-sizing:border-box}',
    '.map433.m433-full{min-height:620px;gap:40px;justify-content:space-between}',
    '.map433.m433-compact{min-height:300px;gap:26px;justify-content:flex-start}',
    '.m433-row{min-width:0}',
    '.m433-tag{font-family:var(--font-cond);font-weight:500;font-size:24px;',
    'letter-spacing:.14em;color:var(--accent);margin-bottom:18px}',
    '.dark .m433-tag{color:var(--light-blue)}',

    /* 4 环节：横向流程 + 回环 */
    '.m433-flow{display:flex;align-items:stretch}',
    '.m433-stage{flex:1 1 0;min-width:0;padding:34px 18px;border:1px solid var(--accent);',
    'text-align:center;font-size:36px;font-weight:500;line-height:1.3;',
    'transition:background .35s ease,color .35s ease,opacity .35s ease,border-color .35s ease}',
    '.m433-stage.m433-wide{flex:1.5 1 0}',
    '.m433-stage.on{background:var(--accent);color:#fff;border-color:var(--accent)}',
    '.m433-stage.off{opacity:.42}',
    '.m433-arr{flex:0 0 44px;display:flex;align-items:center;justify-content:center;',
    'color:var(--accent);font-size:30px;line-height:1}',
    '.dark .m433-arr{color:var(--light-blue-2)}',
    '.m433-loop{position:relative;height:54px;margin-top:2px}',
    '.m433-loop-line{position:absolute;left:30px;right:30px;top:0;height:30px;',
    'border:1px solid var(--accent);border-top:0}',
    '.dark .m433-loop-line{border-color:var(--accent)}',
    '.m433-loop-line::before{content:"";position:absolute;left:-5px;top:-1px;width:9px;height:9px;',
    'border-top:1px solid var(--accent);border-left:1px solid var(--accent);transform:rotate(45deg)}',
    '.m433-loop-text{position:absolute;left:50%;top:30px;transform:translate(-50%,-50%);',
    'padding:0 18px;background:var(--bg);font-size:24px;letter-spacing:.06em;color:var(--accent);',
    'white-space:nowrap}',
    '.dark .m433-loop-text{background:var(--dark);color:var(--light-blue)}',
    '.m433-compact .m433-stage{padding:24px 16px;font-size:34px}',
    '.m433-compact .m433-loop{height:44px}',
    '.m433-compact .m433-loop-line{height:22px}',
    '.m433-compact .m433-loop-text{top:22px}',

    /* 3 角色：一行三格 */
    '.m433-roles{display:flex;background:var(--surface)}',
    '.dark .m433-roles{background:var(--dark-band)}',
    '.m433-role{flex:1 1 0;min-width:0;padding:30px 28px;font-size:32px;line-height:1.5;',
    'text-align:center;transition:opacity .35s ease,background .35s ease,color .35s ease}',
    '.m433-role+.m433-role{border-left:1px solid var(--divider)}',
    '.dark .m433-role+.m433-role{border-left-color:var(--accent-dark)}',
    '.m433-role b{font-weight:500;color:var(--accent-dark)}',
    '.dark .m433-role b{color:var(--light-blue-3)}',
    '.m433-role.on{background:rgba(89,128,166,.16)}',
    '.dark .m433-role.on{background:#33526e}',
    '.m433-role.off{opacity:.42}',

    /* 3 问：编号 01 02 03 */
    '.m433-qs{display:flex;gap:44px}',
    '.m433-q{flex:1 1 0;min-width:0;display:flex;gap:18px;align-items:baseline;',
    'font-size:32px;line-height:1.5}',
    '.m433-q .m433-n{flex:0 0 auto;font-family:var(--font-cond);font-weight:500;',
    'letter-spacing:.1em;color:var(--accent)}',
    '.dark .m433-q .m433-n{color:var(--light-blue-2)}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('map433-css')) return;
    var s = document.createElement('style');
    s.id = 'map433-css';
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
        if (w === ROLES[i].key || w.indexOf(ROLES[i].kw) >= 0 ||
            (ROLES[i].pre + ROLES[i].kw).indexOf(w) >= 0 && w.length > 1) {
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
      else if (k === 'roles' || k === 'role' || k === '角色') out.roles = true;
      else if (k === 'questions' || k === 'question' || k === '问' || k === '三问') out.questions = true;
    }
    if (!out.stages && !out.roles && !out.questions) out.stages = out.roles = out.questions = true;
    return out;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ── 结构 ────────────────────────────────────────────── */
  function rowOpen(kind, rev) {
    return '<div class="m433-row m433-' + kind + (rev ? ' reveal' : '') + '">';
  }
  function stagesHTML(rev) {
    var h = rowOpen('stages', rev) + '<div class="m433-tag">' + TAG_STAGES + '</div><div class="m433-flow">';
    for (var i = 0; i < STAGES.length; i++) {
      if (i) h += '<div class="m433-arr">&#8594;</div>';
      h += '<div class="m433-stage' + (i === STAGES.length - 1 ? ' m433-wide' : '') +
           '" data-i="' + i + '">' + STAGES[i].name + '</div>';
    }
    h += '</div><div class="m433-loop"><span class="m433-loop-line"></span>' +
         '<span class="m433-loop-text">' + LOOP_TEXT + '</span></div></div>';
    return h;
  }
  function rolesHTML(rev) {
    var h = rowOpen('rolesrow', rev) + '<div class="m433-tag">' + TAG_ROLES + '</div><div class="m433-roles">';
    for (var i = 0; i < ROLES.length; i++) {
      h += '<p class="m433-role" data-i="' + i + '">' + ROLES[i].pre + '<b>' + ROLES[i].kw + '</b></p>';
    }
    return h + '</div></div>';
  }
  function questionsHTML(rev) {
    var h = rowOpen('questions', rev) + '<div class="m433-tag">' + TAG_QS + '</div><div class="m433-qs">';
    for (var i = 0; i < QUESTIONS.length; i++) {
      h += '<p class="m433-q"><span class="m433-n">' + pad2(i + 1) + '</span><span>' + QUESTIONS[i] + '</span></p>';
    }
    return h + '</div></div>';
  }

  /* ── 高亮 ────────────────────────────────────────────── */
  function apply(el) {
    var si = matchStage(el.getAttribute('data-stage'));
    var stageEls = el.querySelectorAll('.m433-stage'), i, idx;
    for (i = 0; i < stageEls.length; i++) {
      idx = parseInt(stageEls[i].getAttribute('data-i'), 10);
      stageEls[i].classList.toggle('on', si >= 0 && idx === si);
      stageEls[i].classList.toggle('off', si >= 0 && idx !== si);
    }
    var hit = matchRoles(el.getAttribute('data-roles'));
    var roleEls = el.querySelectorAll('.m433-role');
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
    el.classList.add('map433');
    el.classList.toggle('m433-full', size === 'full');
    el.classList.toggle('m433-compact', size === 'compact');

    var show = parseShow(el.getAttribute('data-show'));
    var rev = norm(el.getAttribute('data-reveal')) === '1';
    var h = '';
    if (show.stages) h += stagesHTML(rev);
    if (show.roles) h += rolesHTML(rev);
    if (show.questions) h += questionsHTML(rev);
    el.innerHTML = h;
    el.setAttribute('data-map433-rendered', '1');
    return apply(el);
  }

  function set(el, opt) {
    if (!el || el.nodeType !== 1) return el;
    opt = opt || {};
    if (!el.getAttribute('data-map433-rendered')) render(el);
    if ('stage' in opt) el.setAttribute('data-stage', opt.stage == null ? '' : String(opt.stage));
    if ('roles' in opt) {
      var r = opt.roles;
      if (r == null) r = '';
      else if (Object.prototype.toString.call(r) === '[object Array]') r = r.join(',');
      el.setAttribute('data-roles', String(r));
    }
    return apply(el);
  }

  function all() {
    var list = Array.prototype.slice.call(document.querySelectorAll('.map433'));
    for (var i = 0; i < list.length; i++) {
      if (!list[i].getAttribute('data-map433-rendered')) render(list[i]);
    }
    return list;
  }

  window.Map433 = { render: render, set: set, all: all };

  injectCSS();
  all();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', all);
  }
})();
