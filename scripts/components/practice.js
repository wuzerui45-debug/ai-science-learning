/* =============================================================================
   scripts/components/practice.js —— 互动练习页
   生活场景判断与快速判断（两种模式呈现方式不同）。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, LESSONS, artThumb, esc, fill, isKid, lessonById, lessonHead, sceneCount, state, tx, ui, verdictOf } = App;


  /* ---------- 互动练习（生活场景判断 + 快速判断） ---------- */
  function renderPractice() {
    const body = $('#lessonBody');
    const lesson = lessonById(state.route.lessonId) || LESSONS[0];
    if (!body) return;
    const practice = lesson.practice;
    const kid = isKid();
    const total = sceneCount(lesson);
    const seenCount = Object.keys(state.session.seen).length;

    const scenes = practice.scenarios.map((sc, i) => {
      const open = state.session.openScene === i;
      const v = verdictOf(lesson, sc.verdict);
      const verdictLine = `<p class="verdict verdict--${v.tone}"><span class="badge badge--${v.tone}">${v.icon} ${esc(v.label)}</span></p>
          <p>${esc(tx(sc.why))}</p>`;
      const head = `<span class="scene-fig" aria-hidden="true">${artThumb(sc.art)}</span>
          <span class="scene-item__name">${esc(tx(sc.name))}</span>`;
      if (kid) {
        return `<li class="scene-item" aria-expanded="${open}">
            <button type="button" class="scene-item__toggle" data-action="open-scene" data-lesson="${lesson.id}" data-index="${i}" aria-expanded="${open}">
              <span class="scene-item__head">${head}<span class="scene-item__hint">${open ? esc(ui().practiceClose) : esc(ui().practiceOpen)}</span></span>
            </button>
            ${open ? `<div class="scene-item__body">${verdictLine}</div>` : ''}
          </li>`;
      }
      return `<li class="scene-item" aria-expanded="${open}">
          <div class="scene-item__head">${head}
            <button type="button" class="btn btn--ghost btn--sm scene-item__toggle" data-action="open-scene" data-lesson="${lesson.id}" data-index="${i}" aria-expanded="${open}">${open ? esc(ui().practiceClose) : esc(ui().practiceOpen)}</button>
          </div>
          ${open ? `<div class="scene-item__body">${verdictLine}</div>` : ''}
        </li>`;
    }).join('');

    const judges = practice.judges.map((item, qi) => {
      const answered = state.session.judge[qi];
      const opts = item.options.map((opt, oi) => {
        let st = '';
        let flag = '';
        if (answered) {
          if (opt.correct) { st = 'correct'; flag = esc(ui().quizFlagRight); }
          else if (answered.picked === oi) { st = 'wrong'; flag = esc(ui().quizFlagWrong); }
          else st = 'muted';
        }
        return `<button type="button" class="option" data-action="answer-judge" data-lesson="${lesson.id}" data-q="${qi}" data-o="${oi}"
            data-state="${st}" ${answered ? 'disabled' : ''}>
            <span class="option__mark" aria-hidden="true">${String.fromCharCode(65 + oi)}</span>
            <span class="option__text">${esc(tx(opt.text))}</span>
            ${flag ? `<span class="option__flag">${flag}</span>` : ''}
          </button>`;
      }).join('');
      const feedback = answered
        ? `<div class="feedback ${answered.correct ? 'feedback--ok' : 'feedback--no'}" tabindex="-1" id="judge-feedback-${qi}">
             <div class="feedback__title">${answered.correct ? '✓ ' + esc(kid ? answered.praise : ui().judgeCorrect) : '✗ ' + esc(ui().judgeWrong)}</div>
             <p>${answered.correct ? '' : esc(ui().quizPickedWrong) + ' '}${esc(tx(item.why))}</p>
           </div>` : '';
      return `<article class="quiz-item">
          <span class="quiz-item__no">${esc(ui().practiceJudgeTitle)} · ${qi + 1} / ${practice.judges.length}</span>
          <p class="quiz-item__q">${esc(tx(item.q))}</p>
          <div class="options">${opts}</div>
          ${feedback}
        </article>`;
    }).join('');

    body.innerHTML = `
      ${lessonHead(lesson, ui().practiceTitle)}

      <section class="block">
        <h2 class="block__title">${esc(ui().practiceTitle)} <span class="count">${esc(fill(ui().practiceAnswered, seenCount))} / ${total}</span></h2>
        <p class="block__intro">${esc(tx(practice.intro))}</p>
        <ul class="scene-list">${scenes}</ul>
      </section>

      <hr class="rule">

      <section class="block">
        <h2 class="block__title">${esc(ui().practiceJudgeTitle)}</h2>
        ${judges}
      </section>

      <nav class="lesson-actions step-nav" aria-label="操作">
        <button type="button" class="btn" data-action="goto-step" data-lesson="${lesson.id}" data-step="${lesson.steps.length - 1}">
          ← ${esc(ui().btnPrev)}
        </button>
        <div class="btn-row">
          <button type="button" class="btn btn--accent" data-action="open-quiz" data-lesson="${lesson.id}">${esc(ui().btnQuiz)} →</button>
          <a class="btn btn--quiet" href="#/courses">${esc(ui().btnBackCatalog)}</a>
        </div>
      </nav>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { renderPractice });
})(window.AIKEPU = window.AIKEPU || {});
