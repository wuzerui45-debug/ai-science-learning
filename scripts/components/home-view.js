/* =============================================================================
   scripts/components/home-view.js —— 首页与课程目录
   首页五讲索引、两种读法入口，以及课程目录页。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, LESSONS, esc, fill, progressSummary, recordOf, state, tx, ui } = App;


  /* ---------- 首页：编辑式头版 ---------- */
  function renderHome() {
    const sum = progressSummary();
    const text = $('#homeProgressText');
    if (text) {
      text.textContent = (sum.done === 0 && sum.doing === 0)
        ? ui().catalogProgressEmpty
        : fill(ui().catalogProgress, sum.done, sum.right);
    }
    const list = $('#homeIndex');
    if (list) {
      list.innerHTML = LESSONS.map((lesson) => {
        const rec = recordOf(lesson.id);
        const st = rec && rec.done ? 'done' : (rec && rec.visited ? 'doing' : 'new');
        let stateText = ui().statusNew;
        if (st === 'done') stateText = '✓ ' + fill(ui().statusDone, rec.best, lesson.quiz.length);
        else if (st === 'doing') stateText = fill(ui().statusDoing, (rec.lastStep || 0) + 1);
        return `<li>
            <button type="button" class="index-item" data-state="${st}" data-action="open-lesson" data-lesson="${lesson.id}"${st === 'doing' ? ' data-resume="1"' : ''}>
              <span class="index-item__no" aria-hidden="true">${String(lesson.id).padStart(2, '0')}</span>
              <span class="index-item__body">
                <span class="index-item__title">${esc(lesson.label)}</span>
                <span class="index-item__meta">${esc(fill(ui().minutesLabel, tx(lesson.minutes)))} · ${lesson.steps.length} 个步骤 · ${lesson.quiz.length} 道测验</span>
              </span>
              <span class="index-item__state">${esc(stateText)}</span>
            </button>
          </li>`;
      }).join('');
    }

    /* 首页主视觉右栏的动物图片识别面板（模块内部自己管状态与交互） */
    if (App.animalLab) App.animalLab.mount();
  }

  /* ---------- 课程目录 ---------- */
  function lessonStatus(lesson) {
    const rec = recordOf(lesson.id);
    if (!rec || (!rec.visited && !rec.done)) return 'new';
    return rec.done ? 'done' : 'doing';
  }

  function modeSwitchInline() {
    return `<div class="mode-inline">
        <span class="mode-inline__label">${esc(ui().switchTip)}</span>
        <div class="segmented" role="group" aria-label="表达模式切换">
          <button type="button" class="segmented__btn" data-action="set-mode" data-mode="child" aria-pressed="${state.mode === 'child'}">儿童版</button>
          <button type="button" class="segmented__btn" data-action="set-mode" data-mode="senior" aria-pressed="${state.mode === 'senior'}">老年版</button>
        </div>
        ${state.mode === 'senior'
          ? `<button type="button" class="switch" data-action="toggle-bigtext" aria-pressed="${state.bigText}">
               <span class="switch__dot" aria-hidden="true"></span><span>${esc(ui().bigTextLabel)}${state.bigText ? '（已打开）' : ''}</span>
             </button>`
          : ''}
        <span class="mode-inline__label" style="flex:1 1 100%">${esc(ui().modeSwitchHint)}</span>
      </div>`;
  }

  function renderCatalog() {
    const body = $('#coursesBody');
    if (!body) return;
    const sum = progressSummary();
    const pct = sum.total ? Math.round((sum.right / sum.total) * 100) : 0;

    const rows = LESSONS.map((lesson) => {
      const status = lessonStatus(lesson);
      const rec = recordOf(lesson.id);
      const qTotal = lesson.quiz.length;
      let primary = `<button type="button" class="btn btn--primary btn--sm" data-action="open-lesson" data-lesson="${lesson.id}">${esc(ui().btnStart)}</button>`;
      let stateText = ui().statusNew;
      let mark = `<span class="badge badge--plain">○ ${esc(ui().statusNew)}</span>`;
      if (status === 'doing') {
        primary = `<button type="button" class="btn btn--primary btn--sm" data-action="open-lesson" data-lesson="${lesson.id}" data-resume="1">${esc(ui().btnResume)}</button>`;
        stateText = fill(ui().statusDoing, (rec ? rec.lastStep : 0) + 1);
        mark = `<span class="badge badge--warn">▶ ${esc(fill(ui().statusDoing, (rec ? rec.lastStep : 0) + 1))}</span>`;
      } else if (status === 'done') {
        primary = `<button type="button" class="btn btn--ghost btn--sm" data-action="open-result" data-lesson="${lesson.id}">${esc(ui().btnOpen)}</button>` +
          `<button type="button" class="btn btn--primary btn--sm" data-action="open-lesson" data-lesson="${lesson.id}">${esc(ui().btnReview)}</button>`;
        stateText = fill(ui().statusDone, rec ? rec.best : 0, qTotal);
        mark = `<span class="badge badge--ok">✓ ${esc(stateText)}</span>`;
      }
      return `<li class="lesson-item">
          <span class="lesson-item__no" aria-hidden="true">${String(lesson.id).padStart(2, '0')}</span>
          <div class="lesson-item__body">
            <h2>${esc(lesson.label)}</h2>
            <p>${esc(tx(lesson.intro))}</p>
            <p class="lesson-item__meta">${esc(fill(ui().minutesLabel, tx(lesson.minutes)))} · ${lesson.steps.length} 个步骤 · ${qTotal} 道测验 · ${mark}</p>
          </div>
          <div class="lesson-item__action">
            ${primary}
            <span class="lesson-item__state">${esc(stateText)}</span>
          </div>
        </li>`;
    }).join('');

    body.innerHTML = `
      <header class="page-head">
        <span class="kicker">科普课堂 · ${esc(ui().modeName)}</span>
        <h1>${esc(ui().catalogTitle)}</h1>
        <p class="lead" style="max-width:46em">${esc(ui().catalogIntro)}</p>
        <p class="meta-row">已学完 <b>${sum.done}</b> 讲 ｜ 学习中 <b>${sum.doing}</b> 讲 ｜ 累计答对 <b>${sum.right}</b> 题（共 ${sum.total} 题）</p>
        <div class="progress" style="margin-top:.7rem;max-width:20rem" role="img" aria-label="学习进度 ${pct}%">
          <div class="progress__bar" style="width:${pct}%"></div>
        </div>
        ${modeSwitchInline()}
      </header>

      <ol class="lesson-list">${rows}</ol>

      <div class="btn-row" style="margin-top:2rem">
        <a class="btn btn--ghost" href="#/home">${esc(ui().btnHome)}</a>
        <a class="btn btn--quiet" href="#/about">关于项目</a>
      </div>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { renderHome, lessonStatus, modeSwitchInline, renderCatalog });
})(window.AIKEPU = window.AIKEPU || {});
