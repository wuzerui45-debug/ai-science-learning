/* =============================================================================
   scripts/animations/switch-view.js —— 课程内容 / 页面内容的切换过渡

   项目的内容切换机制（实际代码）：
     hash 路由变化 → router.onHashChange → render() → 视图容器 .innerHTML 整块重建
     所以“新内容”总是新节点：在这批新节点上做 fromTo，
     不会与旧内容重叠，也不会为了动画延迟任何操作（动画不阻塞点击与路由）。

   三种切换，分别处理以避免动画堆砌：
     1) 换页面 / 换讲（目录 → 课程、课程 → 练习/测验/完成页、回首页等）
        → 内容块整体淡入（最多 5 块，错开 0.045s），课程卡片单独错开
     2) 同一讲内翻步骤（第 1 步 → 第 2 步）
        → 头部保持不动，只让正文与插图淡入，避免整页跳动
        → 本讲进度条补一段 scaleX 过渡（不写 width，保持原样）
     3) 同一路由内的重渲染（作答、展开场景、切模式）
        → 本文件不参与（留给第三阶段的答题反馈动画）

   全程只用 transform / opacity，结束后 clearProps，不残留行内样式。
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, tune } = App;

  /* 内容块：视图容器（.shell）的直接子元素，剔除分隔线与卡片列表
     （卡片由 cards.js 单独错开，避免父子同时淡入导致透明度相乘） */
  function contentIn(view) {
    if (!view) return [];
    const shell = view.querySelector('.shell') || view;
    return Array.prototype.filter.call(shell.children, function (el) {
      if (el.tagName === 'HR') return false;
      if (el.matches('.index-list, .lesson-list')) return false;
      /* 内含课程卡片的区块交给 cards.js 逐行处理，避免父子同时淡入使得透明度相乘 */
      if (el.querySelector('.index-item, .lesson-item')) return false;
      return true;
    }).slice(0, MOTION.content.max);
  }

  /* 1) 换页面 / 换讲：内容块整体淡入 */
  function build(view) {
    const gsap = window.gsap;
    const blocks = contentIn(view);
    if (!gsap || !blocks.length) return null;

    const s = tune({ duration: MOTION.content.duration, y: MOTION.content.y, at: 0 });
    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' } });
    const targets = [];

    tl.fromTo(blocks,
      { autoAlpha: 0, y: s.y },
      { autoAlpha: 1, y: 0, duration: s.duration, stagger: MOTION.content.stagger },
      0);

    /* 细节优化：目录页的整体进度条在进入时从左向右长出（只动 scaleX，width 不动） */
    const totalBar = view.querySelector('.page-head .progress__bar');
    if (totalBar) {
      gsap.set(totalBar, { scaleX: 0, transformOrigin: 'left center' });
      tl.to(totalBar, {
        scaleX: 1,
        duration: MOTION.detail.progressGrow,
        ease: MOTION.ease
      }, MOTION.detail.progressDelay);
      targets.push(totalBar);
    }

    tl.eventCallback('onComplete', function () {
      gsap.set(targets.concat(blocks), { clearProps: 'transform,transformOrigin,opacity,visibility' });
    });
    return tl;
  }

  /* 2) 同一讲内翻步骤：只过渡正文与插图 */
  function stepTargets(root) {
    if (!root) return [];
    return Array.prototype.filter.call([
      root.querySelector('.prose'),
      root.querySelector('.figure')
    ], Boolean);
  }

  function buildStep(root, ratio) {
    const gsap = window.gsap;
    const targets = stepTargets(root);
    if (!gsap || !targets.length) return null;

    const s = tune({ duration: MOTION.content.duration, y: MOTION.content.y, at: 0 });
    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' } });

    tl.fromTo(targets,
      { autoAlpha: 0, y: s.y },
      { autoAlpha: 1, y: 0, duration: s.duration },
      0);

    /* 本讲进度条：从上一进度平滑长到当前进度。
       只动 scaleX，不改行内 width（宽度仍由渲染逻辑写成 50% 等固定值）。 */
    const bar = root.querySelector('.lesson-progress .progress__bar');
    if (bar && typeof ratio === 'number' && ratio >= 0 && ratio < 1) {
      tl.fromTo(bar,
        { scaleX: ratio, transformOrigin: 'left center' },
        { scaleX: 1, duration: MOTION.progress.duration, ease: MOTION.ease },
        0.05);
      targets.push(bar);
    }

    tl.eventCallback('onComplete', function () {
      gsap.set(targets, { clearProps: 'transform,transformOrigin,opacity,visibility' });
    });
    return tl;
  }

  Object.assign(App, {
    contentMotion: { build: build, buildStep: buildStep }
  });
})(window.AIKEPU = window.AIKEPU || {});
