/* =============================================================================
   scripts/components/figure.js —— 插图与图注组件
   统一的「插图 + 图注」标记生成。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { ART_CAPTION, artFor, esc } = App;


  function figureFor(artKey, caption, prefix) {
    return `<figure class="figure">
        ${artFor(artKey, caption)}
        <figcaption class="figcap"><b>${esc(prefix || '图')}</b> · ${esc(caption || ART_CAPTION[artKey] || '')}</figcaption>
      </figure>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { figureFor });
})(window.AIKEPU = window.AIKEPU || {});
