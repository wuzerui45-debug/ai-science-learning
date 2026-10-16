/* =============================================================================
   scripts/utils/text.js —— 双模式文案解析
   同一份知识在儿童模式与老年模式下的文字取值方式。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { UI, state } = App;


  /* 取出「当前模式」对应的文案：既支持 { c, s } 结构，也支持两种模式共用的字符串或数字 */
  function tx(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    const key = state.mode === 'senior' ? 's' : 'c';
    if (value[key] != null) return String(value[key]);
    if (value.c != null) return String(value.c);
    if (value.s != null) return String(value.s);
    return '';
  }
  function ui() { return UI[state.mode]; }
  function isKid() { return state.mode === 'child'; }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { tx, ui, isKid });
})(window.AIKEPU = window.AIKEPU || {});
