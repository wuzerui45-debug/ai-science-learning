/* =============================================================================
   scripts/state/session.js —— 课程会话状态（切换课程时的重置）
   进入某一课时清空上一次的场景展开、作答与步骤；刷新后会话状态按原逻辑重新开始。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { state } = App;


  /* ---------- 进入课程：切换课程时重置本课的互动记录 ---------- */
  function enterLesson(lessonId) {
    if (state.session.lessonId === lessonId) return;
    state.session.lessonId = lessonId;
    state.session.openScene = -1;
    state.session.seen = {};
    state.session.judge = {};
    state.session.quiz = {};
    state.session.quizIndex = 0;
    state.session.step = 0;
  }

  function resetLessonSession(lessonId) {
    state.session.lessonId = lessonId;
    state.session.openScene = -1;
    state.session.seen = {};
    state.session.judge = {};
    state.session.quiz = {};
    state.session.quizIndex = 0;
    state.session.step = 0;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { enterLesson, resetLessonSession });
})(window.AIKEPU = window.AIKEPU || {});
