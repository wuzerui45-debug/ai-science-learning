/* =============================================================================
   scripts/components/result-view.js —— 学习完成页
   成绩、知识总结与后续操作。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, ART_CAPTION, LESSONS, esc, figureFor, fill, lessonById, nextLessonId, paintArtSlots, progressSummary, recordOf, state, ui } = App;


  /* ---------- 学习完成页 ---------- */
  function renderResult() {
    const body = $('#resultBody');
    const lesson = lessonById(state.route.lessonId) || LESSONS[0];
    if (!body) return;
    const rec = recordOf(lesson.id);
    const total = lesson.quiz.length;
    const right = rec ? rec.best : 0;
    const nextId = nextLessonId(lesson.id);
    const summary = lesson.summary[state.mode === 'senior' ? 's' : 'c'];
    const sum = progressSummary();
    const progressLine = (sum.done === 0 && sum.doing === 0)
      ? ui().catalogProgressEmpty
      : fill(ui().catalogProgress, sum.done, sum.right);

    body.innerHTML = `
      <p class="crumb"><a href="#/courses">${esc(ui().crumbCourses)}</a> / ${esc(lesson.no)}</p>

      <div class="result-head">
        <div class="score-figure">
          <span class="score-figure__num">${right}<span style="font-size:.5em;color:var(--ink-3)"> / ${total}</span></span>
          <span class="score-figure__label">${esc(ui().resultScoreLabel)}</span>
        </div>
        <div>
          <span class="kicker">${esc(ui().resultTitle)}</span>
          <h1>${esc(lesson.no)}：${esc(lesson.label)}</h1>
          <p class="lead">${esc(fill(ui().resultCongrats, lesson.label))}</p>
          ${(sum.done > 0 || sum.doing > 0) ? `<p class="muted">${esc(progressLine)}</p>` : ''}
        </div>
      </div>

      <section class="result-block">
        <h2 class="block__title">${esc(ui().resultSummaryTitle)}</h2>
        <ul class="summary-list">
          ${summary.map((item) => `<li><span>${esc(item)}</span></li>`).join('')}
        </ul>
      </section>

      <section class="result-block lesson-aside" style="position:static">
        ${figureFor('summary', ART_CAPTION.summary, '图')}
      </section>

      <div class="btn-row" style="margin-top:2rem">
        <button type="button" class="btn" data-action="relearn" data-lesson="${lesson.id}">${esc(ui().btnRelearn)}</button>
        <a class="btn btn--ghost" href="#/courses">${esc(ui().btnBackCatalog)}</a>
        ${nextId
          ? `<button type="button" class="btn btn--primary" data-action="open-lesson" data-lesson="${nextId}">${esc(ui().btnNextLesson)} →</button>`
          : `<a class="btn btn--primary" href="#/courses">${esc(ui().btnAllDone)}</a>`}
      </div>
      ${nextId ? '' : `<p class="lead" style="margin-top:1rem">${esc(ui().resultAllDone)}</p>`}`;

    paintArtSlots();
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { renderResult });
})(window.AIKEPU = window.AIKEPU || {});
