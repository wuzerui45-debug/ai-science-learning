/* =============================================================================
   scripts/components/quiz.js —— 课程小测验
   题目、选项、判定反馈与成绩面板。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, LESSONS, esc, fill, isKid, lessonById, lessonHead, state, tx, ui } = App;


  /* ---------- 课程小测验 ---------- */
  function quizAnsweredCount(lesson) {
    return Object.keys(state.session.quiz).length;
  }
  function quizRightCount(lesson) {
    return Object.keys(state.session.quiz).filter((k) => state.session.quiz[k].correct).length;
  }

  function quizOptionButton(lesson, qi, opt, oi, answered) {
    let st = '';
    let flag = '';
    if (answered) {
      if (opt.correct) { st = 'correct'; flag = esc(ui().quizFlagRight); }
      else if (answered.picked === oi) { st = 'wrong'; flag = esc(ui().quizFlagWrong); }
      else st = 'muted';
    }
    return `<button type="button" class="option" data-action="answer-quiz" data-lesson="${lesson.id}" data-q="${qi}" data-o="${oi}"
        data-state="${st}" ${answered ? 'disabled' : ''}>
        <span class="option__mark" aria-hidden="true">${String.fromCharCode(65 + oi)}</span>
        <span class="option__text">${esc(tx(opt.text))}</span>
        ${flag ? `<span class="option__flag">${flag}</span>` : ''}
      </button>`;
  }

  function quizFeedback(item, answered, qi, kid) {
    if (!answered) return '';
    const head = answered.correct
      ? '✓ ' + esc(kid ? answered.praise : ui().quizPickedRight)
      : '✗ ' + esc(ui().quizPickedWrong);
    const wrongLead = answered.correct ? '' : esc(ui().quizPickedWrong) + ' ';
    return `<div class="feedback ${answered.correct ? 'feedback--ok' : 'feedback--no'}" tabindex="-1" id="quiz-feedback-${qi}">
        <div class="feedback__title">${head}</div>
        <p>${wrongLead}${esc(tx(item.why))}</p>
      </div>`;
  }

  function renderQuiz() {
    const body = $('#lessonBody');
    const lesson = lessonById(state.route.lessonId) || LESSONS[0];
    if (!body) return;
    const kid = isKid();
    const total = lesson.quiz.length;
    const answeredCount = quizAnsweredCount(lesson);
    const rightCount = quizRightCount(lesson);
    const allDone = answeredCount === total;

    let questions = '';
    if (kid) {
      /* 儿童模式：一次只出现一道题，答完再进入下一题 */
      const qi = Math.max(0, Math.min(total - 1, state.session.quizIndex || 0));
      const item = lesson.quiz[qi];
      const answered = state.session.quiz[qi];
      const opts = item.options.map((opt, oi) => quizOptionButton(lesson, qi, opt, oi, answered)).join('');
      questions = `<article class="quiz-item">
          <span class="quiz-item__no">${esc(fill(ui().quizQuestionNo, qi + 1))} / ${total}</span>
          <p class="quiz-item__q">${esc(tx(item.q))}</p>
          <div class="options">${opts}</div>
          ${quizFeedback(item, answered, qi, kid)}
        </article>
        <div class="btn-row btn-row--between" style="margin-top:1.2rem">
          <button type="button" class="btn" data-action="quiz-prev" data-lesson="${lesson.id}" ${qi === 0 ? 'disabled' : ''}>← ${esc(ui().quizPrevQ)}</button>
          <span class="progress-text">${esc(fill(ui().quizQuestionNo, qi + 1))} / ${total}</span>
          <button type="button" class="btn btn--primary" data-action="quiz-next" data-lesson="${lesson.id}" ${qi === total - 1 ? 'disabled' : ''}>${esc(ui().quizNextQ)} →</button>
        </div>`;
    } else {
      /* 老年友好模式：三道题一次列清，不自动跳转、不限时间 */
      questions = lesson.quiz.map((item, qi) => {
        const answered = state.session.quiz[qi];
        const opts = item.options.map((opt, oi) => quizOptionButton(lesson, qi, opt, oi, answered)).join('');
        return `<article class="quiz-item">
            <span class="quiz-item__no">${esc(fill(ui().quizQuestionNo, qi + 1))} / ${total}</span>
            <p class="quiz-item__q">${esc(tx(item.q))}</p>
            <div class="options">${opts}</div>
            ${quizFeedback(item, answered, qi, kid)}
          </article>`;
      }).join('');
    }

    const scorePanel = allDone
      ? `<div class="card card--brand" style="margin-top:1.6rem">
           <h2 style="margin-bottom:.3rem">${esc(ui().quizAllDone)}</h2>
           <div class="quiz-meter">
             <div><span class="meter__num">${rightCount} / ${total}</span><span class="meter__label">${esc(ui().quizAnsLabel)}</span></div>
             <div><span class="meter__num">${answeredCount}</span><span class="meter__label">${esc(ui().quizAnsweredLabel)}</span></div>
             <div><span class="meter__num">${total}</span><span class="meter__label">${esc(ui().quizTotalLabel)}</span></div>
           </div>
           <div class="btn-row" style="margin-top:1.1rem">
             <button type="button" class="btn btn--primary" data-action="open-result" data-lesson="${lesson.id}">${esc(ui().quizToResult)} →</button>
             <button type="button" class="btn btn--ghost" data-action="retry-quiz" data-lesson="${lesson.id}">${esc(ui().quizRetry)}</button>
           </div>
         </div>`
      : `<p class="footnote" style="margin-top:1.6rem">${esc(ui().quizNeedMore)}</p>`;

    body.innerHTML = `
      ${lessonHead(lesson, ui().quizTitle)}

      <section class="block">
        <h2 class="block__title">${esc(ui().quizTitle)}
          <span class="chip">${esc(ui().quizAnsweredLabel)} ${answeredCount}/${total}</span>
          <span class="chip chip--green">${esc(ui().quizAnsLabel)} ${rightCount}</span>
        </h2>
        <p class="block__intro">${esc(ui().quizIntro)}</p>
        ${questions}
        ${scorePanel}
      </section>

      <nav class="lesson-actions step-nav" aria-label="操作">
        <button type="button" class="btn" data-action="open-practice" data-lesson="${lesson.id}">← ${esc(ui().practiceTitle)}</button>
        <div class="btn-row">
          <button type="button" class="btn btn--ghost" data-action="retry-quiz" data-lesson="${lesson.id}">${esc(ui().quizRetry)}</button>
          <a class="btn btn--quiet" href="#/courses">${esc(ui().btnBackCatalog)}</a>
        </div>
      </nav>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { quizAnsweredCount, quizRightCount, quizOptionButton, quizFeedback, renderQuiz });
})(window.AIKEPU = window.AIKEPU || {});
