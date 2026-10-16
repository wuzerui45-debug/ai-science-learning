/* =============================================================================
   scripts/components/navigation.js —— 顶栏折叠菜单
   手机端菜单的展开与收起（原「第七部分」中的菜单控制）。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $ } = App;


  /* ---------- 手机端导航菜单：真实可展开、可收起 ---------- */
  function setMenu(open) {
    const panel = $('#topbarPanel');
    const btn = $('#menuBtn');
    if (!panel || !btn) return;
    panel.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeMenu() { setMenu(false); }
  function isMenuOpen() {
    const panel = $('#topbarPanel');
    return !!panel && panel.getAttribute('data-open') === 'true';
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { setMenu, closeMenu, isMenuOpen });
})(window.AIKEPU = window.AIKEPU || {});
