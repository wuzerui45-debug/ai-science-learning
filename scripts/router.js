/* =============================================================================
   scripts/router.js —— 地址路由（hash 路由与地址参数）
   解析 #/lesson/1/2 之类的地址、修正非法地址、处理刷新恢复与 ?mode/?big 参数。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { LESSONS, MODES, closeMenu, enterLesson, lessonById, markVisited, persist, render, state, toast, ui } = App;


  function lessonHash(id, part) {
    return '#/lesson/' + id + (part === undefined || part === null || part === '' ? '' : '/' + part);
  }

  /* ---------- 地址（hash 路由）工具 ---------- */
  function hashFor(name, lessonId, step) {
    if (name === 'courses') return '#/courses';
    if (name === 'about') return '#/about';
    if (name === 'home') return '#/home';
    const id = lessonId == null ? (state.route.lessonId || LESSONS[0].id) : lessonId;
    const part = (step === undefined || step === null || step === '') ? '' : '/' + step;
    return '#/lesson/' + id + part;
  }
  function go(name, lessonId, step) {
    const hash = hashFor(name, lessonId, step);
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }
  /* =====================================================================
     第八部分：地址路由与初始化
     使用 hash 路由，刷新页面后可以回到原来的一课、一个步骤，
     地址不合法时会自动修正到有效页面，不会出现空白或报错状态。
     ===================================================================== */
  function tryReplace(hash) {
    try {
      window.history.replaceState(null, '', hash);
    } catch (err) {
      /* 某些浏览器在本地文件页面不允许改写地址，忽略即可：页面内容已经修正 */
    }
  }

  function parseHash() {
    let parts = [];
    const rawHash = window.location.hash || '';
    try {
      parts = rawHash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    } catch (err) {
      parts = [];
    }
    const home = { name: 'home', lessonId: null, step: 0, sub: 'step' };

    if (parts.length === 0 || parts[0] === 'home') { state.route = home; return { ok: true }; }
    if (parts[0] === 'courses') { state.route = { name: 'courses', lessonId: null, step: 0, sub: 'step' }; return { ok: true }; }
    if (parts[0] === 'about') { state.route = { name: 'about', lessonId: null, step: 0, sub: 'step' }; return { ok: true }; }

    if (parts[0] === 'lesson') {
      const lesson = lessonById(parts[1]);
      if (!lesson) { state.route = home; return { ok: false }; }
      enterLesson(lesson.id);
      const route = { name: 'lesson', lessonId: lesson.id, step: 0, sub: 'step' };
      const tail = parts[2];
      if (tail === 'practice') {
        route.sub = 'practice';
      } else if (tail === 'quiz') {
        route.sub = 'quiz';
      } else if (tail === 'result') {
        route.name = 'result';
        route.sub = 'result';
      } else if (tail === undefined) {
        route.sub = 'step';
        route.step = 0;
      } else {
        const num = Number(tail);
        if (isFinite(num) && num >= 0 && num < lesson.steps.length) {
          route.step = Math.floor(num);
        } else {
          route.step = 0;
          tryReplace(lessonHash(lesson.id, 0));
        }
      }
      state.route = route;
      if (route.name === 'lesson' && route.sub === 'step') markVisited(lesson.id, route.step);
      return { ok: true };
    }

    state.route = home;
    return { ok: false };
  }

  function onHashChange() {
    const parsed = parseHash();
    closeMenu();                 /* 手机端：跳转后自动收起菜单 */
    render();
    window.scrollTo(0, 0);
    if (!parsed.ok) toast(ui().toastRoute);
  }

  /* 地址参数：?mode=senior 可以直接用某种模式打开，?big=1 直接开启大字阅读 */
  function applyUrlOptions() {
    const search = window.location.search || '';
    if (!search) return;
    const params = {};
    search.replace(/^\?/, '').split('&').filter(Boolean).forEach((pair) => {
      const kv = pair.split('=');
      let key = kv[0];
      let value = kv[1] || '';
      try { key = decodeURIComponent(key); value = decodeURIComponent(value); } catch (err) { /* 保留原值 */ }
      params[key] = value;
    });
    let changed = false;
    if (MODES.indexOf(params.mode) >= 0 && params.mode !== state.mode) {
      state.mode = params.mode;
      changed = true;
    }
    if (params.big === '1' && !state.bigText) {
      state.bigText = true;
      changed = true;
    }
    if (params.big === '0' && state.bigText) {
      state.bigText = false;
      changed = true;
    }
    if (changed) persist();
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { lessonHash, hashFor, go, tryReplace, parseHash, onHashChange, applyUrlOptions });
})(window.AIKEPU = window.AIKEPU || {});
