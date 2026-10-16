/* =============================================================================
   scripts/utils/dom.js —— DOM 与字符串基础工具
   原 index.html「第五部分」中的通用工具，供各模块复用。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';


  /* ---------- 通用工具 ---------- */
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* 文案模板：把 %name% 替换为实际内容 */
  function fill(template) {
    const args = Array.prototype.slice.call(arguments, 1);
    let i = 0;
    return String(template).replace(/%[a-z]+%/g, () => (args[i] === undefined ? '' : String(args[i++])));
  }
  /* ---------- 轻提示 ---------- */
  let toastTimer = null;
  function toast(message) {
    const el = $('#toast');
    if (!el || !message) return;
    el.textContent = message;
    el.setAttribute('data-show', 'true');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.setAttribute('data-show', 'false');
    }, 3600);
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { $, $$, esc, fill, toast });
})(window.AIKEPU = window.AIKEPU || {});
