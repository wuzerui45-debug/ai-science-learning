/* =============================================================================
   scripts/components/lesson-view.js —— 分步讲解页
   课程头部、步骤导航、正文/案例/插图版式（五讲按知识类型使用不同图文关系）。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, ART, ART_CAPTION, LESSONS, esc, figureFor, fill, isKid, lessonById, state, tx, ui } = App;


  /* 讲解版式：按每讲的知识类型决定图文关系，五讲不再套用同一种结构
       aside 概念界定：正文为主，解释图在右（图文并列）
       flow  过程流程：插图夹排在引题之后，正文收窄成易读行宽
       duo   分类列举：插图随正文排入栏内，正文分两栏（宽屏）
       left  对错判断：误判图示在左，先看图再读原因
       end   行为守则：正文单栏通读，小结作页边注，插图收在文末       */
  const LESSON_LAYOUT = { 1: 'aside', 2: 'flow', 3: 'duo', 4: 'left', 5: 'end' };
  const LESSON_LAYOUT_CLASS = { flow: ' lesson-body--stack', duo: ' lesson-body--stack', left: ' lesson-body--mirror', end: ' lesson-body--end' };
  const LESSON_PROSE_CLASS = { flow: ' prose--flow', duo: ' prose--duo' };

  /* ---------- 课程学习页：公共头部 ---------- */
  function lessonHead(lesson, currentLabel) {
    return `
      <p class="crumb"><a href="#/courses">${esc(ui().crumbCourses)}</a> / ${esc(lesson.no)} / ${esc(currentLabel)}</p>
      <header class="lesson-head">
        <div class="lesson-head__row">
          <h1><span class="lesson-head__no">${esc(lesson.no)}</span>${esc(lesson.label)}</h1>
          <div class="lesson-head__tools">
            <div class="segmented" role="group" aria-label="表达模式切换">
              <button type="button" class="segmented__btn" data-action="set-mode" data-mode="child" aria-pressed="${state.mode === 'child'}">儿童版</button>
              <button type="button" class="segmented__btn" data-action="set-mode" data-mode="senior" aria-pressed="${state.mode === 'senior'}">老年版</button>
            </div>
            ${state.mode === 'senior'
              ? `<button type="button" class="switch" data-action="toggle-bigtext" aria-pressed="${state.bigText}">
                   <span class="switch__dot" aria-hidden="true"></span><span>${esc(ui().bigTextLabel)}${state.bigText ? '（已打开）' : ''}</span>
                 </button>`
              : ''}
          </div>
        </div>
      </header>`;
  }

  /* ---------- 课程学习页：分步讲解 ---------- */
  function renderLesson() {
    const body = $('#lessonBody');
    const lesson = lessonById(state.route.lessonId) || LESSONS[0];
    if (!body) return;

    if (state.route.sub === 'practice') { App.renderPractice(lesson); return; }
    if (state.route.sub === 'quiz') { App.renderQuiz(lesson); return; }

    const total = lesson.steps.length;
    const index = Math.max(0, Math.min(total - 1, Number(state.route.step) || 0));
    state.session.step = index;
    const step = lesson.steps[index];
    const d = step[state.mode === 'senior' ? 's' : 'c'];
    const kid = isKid();
    const pct = Math.round(((index + 1) / total) * 100);

    const points = d.points.map((p) => `<li><span>${esc(p)}</span></li>`).join('');
    const scene = d.scene
      ? `<aside class="case">
           <span class="case__label">生活案例</span>
           <p>${esc(d.scene.text)}</p>
         </aside>` : '';

    let ask = '';
    if (d.ask) {
      ask = kid
        ? `<div class="mascot">
             <span class="mascot__art" aria-hidden="true">${ART.mascotKid(state.mode)}</span>
             <div class="ask">
               <span class="ask__label">${esc(ui().guideName)} 想问你</span>
               <p>${esc(d.ask)}</p>
             </div>
           </div>`
        : `<div class="note note--warn" style="margin-top:1.2rem">
             <div><strong>可以想一想：</strong>${esc(d.ask)}</div>
           </div>`;
    }
    /* 老年模式的要点框：内容自带小标题（如「要点：」「易错提醒：」）时不再重复加前缀 */
    const noteText = d.note ? String(d.note) : '';
    const noteSelfLabeled = /^[^：]{1,8}：/.test(noteText);
    const note = (!kid && noteText)
      ? `<div class="note note--brand" style="margin-top:1.2rem">
           <div>${noteSelfLabeled ? '' : `<strong>${esc(ui().guideName)}：</strong>`}${esc(noteText)}</div>
         </div>` : '';

    const dots = lesson.steps.map((s, i) =>
      `<button type="button" class="step-dot" data-action="goto-step" data-lesson="${lesson.id}" data-step="${i}"
        aria-current="${i === index}" data-visited="${i <= index}" aria-label="第 ${i + 1} 步">${i + 1}</button>`).join('');

    const nextLabel = index === total - 1 ? ui().btnPractice : ui().btnNext;

    const layout = LESSON_LAYOUT[lesson.id] || 'aside';
    const inFlow = layout === 'flow' || layout === 'duo';   /* 插图排进正文 */
    const marginNote = layout === 'end';                    /* 小结移到页边注 */
    const figure = figureFor(step.art, ART_CAPTION[step.art] || d.title, '图 ' + (index + 1));
    const noteInner = `<strong>本讲 · ${esc(lesson.label)}</strong>
            <p class="muted" style="font-size:.9rem">${esc(tx(lesson.intro))}</p>`;
    const foot = marginNote ? '' : `<div class="takeaway${layout === 'aside' ? '' : ' takeaway--foot'}">${noteInner}</div>`;
    const noteAside = marginNote ? `<div class="takeaway takeaway--note">${noteInner}</div>` : '';
    const article = `<article class="prose${LESSON_PROSE_CLASS[layout] || ''}">
          <h2 class="prose__title">${esc(d.title)}</h2>
          <p class="prose__lead">${esc(d.lead)}</p>
          ${inFlow ? figure : ''}
          <ul class="points">${points}</ul>
          ${scene}
          ${note}
          ${ask}
          ${foot}
        </article>`;
    let aside = '';
    if (layout === 'aside') aside = `<aside class="lesson-aside">${figure}${foot}</aside>`;
    else if (!inFlow) aside = `<aside class="lesson-aside">${figure}</aside>`;
    /* 误判类课程先看图（图示在左）；小结页边注排在正文之后，窄屏自然落到文末 */
    const bodyInner = (layout === 'left' ? aside + article : article + aside) + noteAside;


    body.innerHTML = `
      ${lessonHead(lesson, fill(ui().stepLabel, index + 1, total))}
      <div class="lesson-progress">
        <span class="lesson-progress__text">${esc(fill(ui().stepLabel, index + 1, total))}</span>
        <span class="progress lesson-progress__track" role="img" aria-label="本讲进度 ${pct}%">
          <span class="progress__bar" style="width:${pct}%"></span>
        </span>
      </div>

      <div class="lesson-body${LESSON_LAYOUT_CLASS[layout] || ''}" data-layout="${layout}">
        ${bodyInner}
      </div>

      <nav class="lesson-actions step-nav" aria-label="步骤导航">
        <button type="button" class="btn" data-action="goto-step" data-lesson="${lesson.id}" data-step="${index - 1}"
          ${index === 0 ? 'disabled' : ''}>← ${esc(ui().btnPrev)}</button>
        <div class="step-dots" role="group" aria-label="步骤导航">${dots}</div>
        <button type="button" class="btn btn--primary" data-action="goto-step" data-lesson="${lesson.id}" data-step="${index + 1}"
          data-next="${index === total - 1 ? 'practice' : 'step'}">${esc(nextLabel)} →</button>
      </nav>

      <div class="lesson-cta">
        <p class="lesson-cta__tip">${index === total - 1 ? esc(ui().lastStepTip) : esc(fill(ui().stepCountLabel, total))}</p>
        <div class="btn-row">
          <button type="button" class="btn btn--accent btn--sm" data-action="open-practice" data-lesson="${lesson.id}">${esc(ui().btnPractice)}</button>
          <button type="button" class="btn btn--sm" data-action="open-quiz" data-lesson="${lesson.id}">${esc(ui().btnQuiz)}</button>
          <a class="btn btn--quiet btn--sm" href="#/courses">${esc(ui().btnBackCatalog)}</a>
        </div>
      </div>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { LESSON_LAYOUT, LESSON_LAYOUT_CLASS, LESSON_PROSE_CLASS, lessonHead, renderLesson });
})(window.AIKEPU = window.AIKEPU || {});
