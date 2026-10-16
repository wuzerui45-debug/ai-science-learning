/* =============================================================================
   scripts/state/app-state.js —— 应用状态与课程数据整合
   原 index.html「第五部分」开头。状态结构与默认值保持不变。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { LESSONS_A, LESSONS_B } = App;

  /* =====================================================================
     第五部分：数据整合、状态管理与通用工具
     ===================================================================== */
  const LESSONS = LESSONS_A.concat(LESSONS_B);
  const STORAGE_KEY = 'yifenzhishi-ai-kepu-v1';
  const MODES = ['child', 'senior'];

  /* 应用状态：模式、大字开关、学习记录（可持久化）+ 会话状态（刷新后重置） */
  const state = {
    mode: 'child',
    bigText: false,
    records: {},                       /* { 课程号: { done, best, total, visited, lastStep } } */
    route: { name: 'home', lessonId: null, step: 0, sub: null },
    session: {
      lessonId: null,
      step: 0,
      openScene: -1,                   /* 当前展开的场景卡片序号 */
      seen: {},                        /* 已查看过说明的场景 */
      judge: {},                       /* 快速判断题作答记录 */
      quiz: {},                        /* 小测验作答记录 */
      quizIndex: 0                     /* 儿童模式：当前题目序号 */
    }
  };

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { LESSONS, STORAGE_KEY, MODES, state });
})(window.AIKEPU = window.AIKEPU || {});
