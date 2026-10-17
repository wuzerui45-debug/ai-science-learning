/* =============================================================================
   scripts/animations/presets.js —— 首屏动画的参数与运行条件

   本文件只存放参数与判断函数，不含任何动画逻辑，便于统一调整节奏。
   参数依据「编辑式科普」的视觉语言：位移小（≤10px）、时长短（≤0.62s）、
   只用 transform 与 opacity，不改变任何布局属性。

   依赖顺序：state（第 6） → 本文件 → entrance.js → motion.js → app-shell.js
   ============================================================================= */
(function (App) {
  'use strict';

  const { state } = App;

  /* 首屏（#view-home .masthead）各元素的节奏参数
     at     —— 在时间轴上的开始时刻（秒）
     duration —— 时长（秒）
     y      —— 垂直位移（px），老年模式下会按 seniorY 比例收敛 */
  const MOTION = {
    ease: 'power2.out',            /* 与 CSS 的 cubic-bezier(.2,.7,.3,1) 观感接近，且无需额外插件 */
    hero: {
      kicker:  { at: 0.00, duration: 0.32, y: 6 },
      title:   { at: 0.04, duration: 0.55, y: 10 },
      intro:   { at: 0.18, duration: 0.45, y: 8 },
      points:  { at: 0.30, duration: 0.32, y: 6, stagger: 0.05 },
      figure:  { at: 0.16, duration: 0.62, y: 8 },
      caption: { at: 0.50, duration: 0.38, y: 0 }
    },
    senior: {                       /* 老年友好模式：更短、更轻，位移几乎不可察 */
      durationScale: 0.7,
      yScale: 0.35
    },
    bigText: {                      /* 大字阅读：进一步收敛位移，避免阅读时视线跳动 */
      yScale: 0.6
    },
    /* ---------- 第二阶段：课程卡片与内容切换 ---------- */
    cards: {                        /* 课程卡片错开进入（首页五讲索引 / 课程目录行） */
      duration: 0.38,
      y: 8,
      stagger: 0.05,
      max: 8,                       /* 最多同时错开 8 个，避免列表长时收尾太慢 */
      heroDelay: 0.42               /* 首屏有入场动画时，卡片等首屏进入尾声再出现 */
    },
    content: {                      /* 课程/页面内容切换：整块淡入 + 极小位移 */
      duration: 0.34,
      y: 6,
      stagger: 0.045,
      max: 5
    },
    progress: {                     /* 步骤切换时本讲进度条的补充过渡 */
      duration: 0.4
    },
    /* ---------- 第三阶段：答题与交互反馈 ---------- */
    feedback: {
      duration: 0.24,               /* 反馈块淡入 + 轻微上移 */
      y: 6,
      optionScale: 1.015,           /* 被选中选项的轻微缩放（不做抖动） */
      optionDuration: 0.13,
      flagDuration: 0.22,           /* ✓ / ✗ 标记出现 */
      panelDuration: 0.34,          /* 一讲答完后的成绩面板 */
      panelY: 6,
      sceneY: 4,                    /* 生活场景展开的说明块 */
      scoreScale: 0.96,             /* 完成页分数块（只缩容器，不动数字） */
      scoreDuration: 0.4
    },
    hover: {                        /* 桌面端卡片悬停（仅指针设备、非老年模式） */
      lift: -2,
      duration: 0.18,
      back: 0.22
    },
    /* ---------- 第四阶段：滚动触发 ---------- */
    scroll: {
      duration: 0.5,
      stagger: 0.07,
      start: 'top 90%',             /* 元素顶部到达视口 90% 高度时触发 */
      once: true                    /* 只播一次：反复上下滚动不重播，避免干扰阅读 */
    },
    detail: {
      progressGrow: 0.5,            /* 目录页整体进度条：进入时从左到右长出 */
      progressDelay: 0.18
    },
  };

  /* 是否关闭动画：
       1) 地址带 ?motion=off（供自动化测试与低配设备使用）
       2) 系统开启「减少动态效果」
       3) GSAP 未成功加载（例如文件缺失） */
  function motionOff() {
    if (!window.gsap) return true;
    if (/(^|[?&])motion=off(&|$)/.test(window.location.search || '')) return true;
    if (window.matchMedia) {
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      } catch (err) { /* 老浏览器没有该媒体查询时忽略 */ }
    }
    return false;
  }

  function isSenior() {
    return !!state && state.mode === 'senior';
  }

  function isBigText() {
    return document.documentElement.classList.contains('big-text');
  }

  /* 按当前模式折算时长与位移 */
  function tune(step) {
    const senior = isSenior();
    const big = isBigText();
    let duration = step.duration;
    let y = step.y;
    if (senior) {
      duration *= MOTION.senior.durationScale;
      y *= MOTION.senior.yScale;
    }
    if (big) y *= MOTION.bigText.yScale;
    return { duration: duration, y: y, at: step.at, stagger: step.stagger };
  }

  Object.assign(App, { MOTION, motionOff, isSenior, tune });
})(window.AIKEPU = window.AIKEPU || {});
