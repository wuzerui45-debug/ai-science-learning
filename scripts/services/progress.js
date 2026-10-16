/* =============================================================================
   scripts/services/progress.js —— 学习记录、进度统计与课程数据访问
   学习记录读写、进度统计、课程/插画/结论查询。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { ART, DEFAULT_VERDICTS, LESSONS, STORAGE_KEY, VERDICT_ICON, esc, persist, setCompactArt, state, storageRemove, tx } = App;


  /* ---------- 学习记录读写 ---------- */
  function recordOf(lessonId) {
    return state.records[lessonId] || null;
  }
  function ensureRecord(lessonId) {
    if (!state.records[lessonId]) {
      const lesson = lessonById(lessonId);
      state.records[lessonId] = {
        done: false, visited: false, best: 0,
        total: lesson && lesson.quiz ? lesson.quiz.length : 0,
        lastStep: 0
      };
    }
    return state.records[lessonId];
  }
  function markVisited(lessonId, step) {
    const rec = ensureRecord(lessonId);
    rec.visited = true;
    if (typeof step === 'number' && step > (rec.lastStep || 0)) rec.lastStep = step;
    persist();
  }
  function markDone(lessonId, right, total) {
    const rec = ensureRecord(lessonId);
    rec.visited = true;
    rec.done = true;
    rec.total = total;
    if (right > rec.best) rec.best = right;
    persist();
  }
  function resetProgress() {
    state.records = {};
    storageRemove(STORAGE_KEY);
    persist();
  }

  function progressSummary() {
    let done = 0, right = 0, total = 0, doing = 0;
    LESSONS.forEach((lesson) => {
      const rec = state.records[lesson.id];
      /* 题目总数按全部课程累计，未开始的课程也要计入 */
      total += lesson.quiz.length;
      if (!rec) return;
      if (rec.done) done += 1;
      else if (rec.visited) doing += 1;
      right += rec.best || 0;
    });
    return { done: done, doing: doing, right: right, total: total };
  }

  function nextLessonId(afterId) {
    const index = LESSONS.findIndex((l) => l.id === afterId);
    if (index < 0) return null;
    const next = LESSONS[index + 1];
    return next ? next.id : null;
  }

  function lessonById(id) {
    const num = Number(id);
    return LESSONS.find((l) => l.id === num) || null;
  }

  function artFor(key, label) {
    const fn = ART[key] || ART.generic;
    const inner = fn(state.mode);
    const text = label ? `<span class="sr-only">${esc(label)}</span>` : '';
    return `<div class="art-slot" role="img" aria-label="${esc(label || '课程插画')}">${inner}${text}</div>`;
  }

  /* 场景卡片里的缩略插画：省略底部文字标注，只保留图形 */
  function artThumb(key) {
    const fn = ART[key] || ART.generic;
    setCompactArt(true);
    const markup = fn(state.mode);
    setCompactArt(false);
    return markup;
  }

  /* 结论槽位文案：优先使用课程自定义的 verdicts，否则使用默认的「是否使用人工智能」 */
  function verdictOf(lesson, key) {
    const custom = lesson && lesson.practice && lesson.practice.verdicts;
    const def = (custom && custom[key]) || DEFAULT_VERDICTS[key] || DEFAULT_VERDICTS.maybe;
    return { label: tx(def.label), tone: def.tone || 'brand', icon: VERDICT_ICON[key] || '?' };
  }

  /* 场景卡片在两种模式下的呈现方式不同：儿童模式是翻卡片，老年模式是清单 + 说明 */
  function sceneCount(lesson) {
    return lesson.practice && lesson.practice.scenarios ? lesson.practice.scenarios.length : 0;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { recordOf, ensureRecord, markVisited, markDone, resetProgress, progressSummary, nextLessonId, lessonById, artFor, artThumb, verdictOf, sceneCount });
})(window.AIKEPU = window.AIKEPU || {});
