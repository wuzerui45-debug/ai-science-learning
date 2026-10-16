/* =============================================================================
   scripts/main.js —— 应用入口与初始化
   按原顺序执行：读取存储 → 应用地址参数 → 同步外壳 → 首次渲染 → 注册事件监听；DOM 就绪后只执行一次。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { applyShell, applyUrlOptions, closeMenu, loadPersisted, onDocumentClick, onHashChange, onKeyDown, parseHash, render, toast, ui } = App;


  function init() {
    loadPersisted();
    applyUrlOptions();
    applyShell();
    const parsed = parseHash();
    render();
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);
    /* 回到电脑端宽度时收起手机端菜单，避免留下展开状态 */
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const onDesktopChange = () => { if (desktopQuery.matches) closeMenu(); };
    if (typeof desktopQuery.addEventListener === 'function') desktopQuery.addEventListener('change', onDesktopChange);
    else if (typeof desktopQuery.addListener === 'function') desktopQuery.addListener(onDesktopChange);
    if (!parsed.ok) toast(ui().toastRoute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { init });
})(window.AIKEPU = window.AIKEPU || {});
