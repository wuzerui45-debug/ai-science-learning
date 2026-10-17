/* =============================================================================
   scripts/components/app-shell.js —— 页面外壳同步与视图调度
   模式/字号同步到 <html>、插画占位绘制、视图切换与标题更新。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, $$, ART, lessonById, state, ui } = App;

  /* =====================================================================
     第六部分：视图渲染
     render() 根据当前地址决定显示哪个视图：
       首页 / 课程目录 / 课程学习（讲解步骤·互动练习·小测验）/ 学习完成页 / 关于项目
     版式说明：知识正文直接排版，只有操作控件、案例与反馈使用细线或底纹区分。
     ===================================================================== */

  /* ---------- 页面外壳：模式、字号、导航高亮 ---------- */
  function applyShell() {
    const root = document.documentElement;
    root.setAttribute('data-mode', state.mode);
    root.classList.toggle('big-text', state.mode === 'senior' && state.bigText);

    $$('.segmented__btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-mode') === state.mode));
    });

    const bigBtn = $('#bigTextBtn');
    if (bigBtn) {
      bigBtn.hidden = state.mode !== 'senior';
      bigBtn.setAttribute('aria-pressed', String(state.bigText));
      const textNode = bigBtn.lastElementChild;
      if (textNode) textNode.textContent = ui().bigTextLabel + (state.bigText ? '（已打开）' : '');
    }

    $$('.nav__link').forEach((link) => {
      const key = link.getAttribute('data-nav');
      const active = key === state.route.name || (key === 'courses' && state.route.name === 'lesson');
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const modeChip = $('#currentModeChip');
    if (modeChip) modeChip.textContent = '当前读法：' + ui().modeName;

    paintArtSlots();
  }

  /* 静态插画占位：把 [data-art] 节点替换为当前模式对应的 SVG */
  function paintArtSlots() {
    $$('[data-art]').forEach((el) => {
      const fn = ART[el.getAttribute('data-art')] || ART.generic;
      el.innerHTML = fn(state.mode);
    });
  }

  function showView(name) {
    $$('.view').forEach((view) => { view.hidden = view.getAttribute('data-view') !== name; });
  }

  function render() {
    applyShell();
    const route = state.route;
    if (route.name === 'courses') {
      showView('courses');
      App.renderCatalog();
    } else if (route.name === 'about') {
      showView('about');
    } else if (route.name === 'lesson') {
      showView('lesson');
      App.renderLesson();
    } else if (route.name === 'result') {
      showView('result');
      App.renderResult();
    } else {
      showView('home');
      App.renderHome();
    }
    updateDocTitle();
    /* 动画钩子（第二阶段）：仅在引入动画模块时生效。内部自行判断
       “路由是否真的变了”以及 ?motion=off / 减少动态效果，
       不影响任何渲染与业务逻辑；没有该模块时这一行什么也不做。 */
    if (App.motion) App.motion.afterRender(route);
  }

  function updateDocTitle() {
    const route = state.route;
    let name = '首页';
    if (route.name === 'courses') name = '科普课堂';
    else if (route.name === 'about') name = '关于项目';
    else if (route.name === 'result') name = '学习完成';
    else if (route.name === 'lesson') {
      const lesson = lessonById(route.lessonId);
      name = lesson ? lesson.no + ' ' + lesson.label : '课程学习';
      if (route.sub === 'practice') name += ' · 互动练习';
      if (route.sub === 'quiz') name += ' · 小测验';
    }
    document.title = name + ' · 一份知识，两种表达';
  }

  /* 重新渲染时保持滚动位置，并把焦点放回指定元素 */
  function rerenderKeepScroll(focusSelector) {
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    if (focusSelector) {
      const el = $(focusSelector);
      if (el && typeof el.focus === 'function') el.focus({ preventScroll: true });
    }
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { applyShell, paintArtSlots, showView, render, updateDocTitle, rerenderKeepScroll });
})(window.AIKEPU = window.AIKEPU || {});
