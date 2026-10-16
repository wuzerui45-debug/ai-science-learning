/* =============================================================================
   scripts/services/storage.js —— 本地存储读写
   键名、序列化格式、保存时机与恢复行为与原文件一致，旧数据可直接读取。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { LESSONS, MODES, STORAGE_KEY, state } = App;


  /* ---------- 本地存储（可能被浏览器隐私设置禁用，因此全部包在 try 中） ---------- */
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (err) { return false; }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (err) { /* 忽略 */ }
  }

  function loadPersisted() {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return;
    let data = null;
    try { data = JSON.parse(raw); } catch (err) { data = null; }
    if (!data || typeof data !== 'object') { storageRemove(STORAGE_KEY); return; }
    if (MODES.indexOf(data.mode) >= 0) state.mode = data.mode;
    state.bigText = data.bigText === true;
    if (data.records && typeof data.records === 'object') {
      LESSONS.forEach((lesson) => {
        const rec = data.records[lesson.id];
        if (!rec || typeof rec !== 'object') return;
        const total = Array.isArray(lesson.quiz) ? lesson.quiz.length : 0;
        state.records[lesson.id] = {
          done: rec.done === true,
          visited: rec.visited === true,
          best: Math.max(0, Math.min(total, Number(rec.best) || 0)),
          total: total,
          lastStep: Math.max(0, Number(rec.lastStep) || 0)
        };
      });
    }
  }

  function persist() {
    storageSet(STORAGE_KEY, JSON.stringify({
      mode: state.mode,
      bigText: state.bigText,
      records: state.records
    }));
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { storageGet, storageSet, storageRemove, loadPersisted, persist });
})(window.AIKEPU = window.AIKEPU || {});
