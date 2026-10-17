/* =============================================================================
   scripts/animations/entrance.js —— 首屏（首页头版）进入动画

   只负责「把首屏元素按节奏排进一条时间轴」，不负责判断是否运行，
   也不负责任务调度（由 motion.js 统一处理）。

   动画对象（以实际 DOM 为准，缺哪个就跳过哪个）：
     .masthead .kicker         眉标「人工智能基础科普 · 五讲」
     .masthead__title          问题式主标题（两行）
     .masthead__intro          导语
     .masthead__points > li    三条简短回答
     .masthead .figure         主视觉插图
     .masthead .figcap         插图图注

   实现要点：
     · 统一使用 fromTo：首屏元素在样式里被预置隐藏（opacity:0），
       若用 from() 会把「当前计算值 0」当成终点，导致透明度始终为 0；
       显式写出终点值才是正确的做法。
     · 全程只用 transform / opacity，不改变任何布局属性。
     · 结束后 clearProps 交还给 CSS，不在 DOM 上留下行内样式。
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, tune } = App;

  function pick(root, selector) {
    return root ? root.querySelector(selector) : null;
  }

  /* 返回时间轴；若首屏不存在则返回 null */
  function build(root) {
    const gsap = window.gsap;
    if (!gsap || !root) return null;

    const kicker = pick(root, '.kicker');
    const title = pick(root, '.masthead__title');
    const intro = pick(root, '.masthead__intro');
    const points = root.querySelectorAll('.masthead__points > li');
    const figure = pick(root, '.figure');
    const caption = pick(root, '.figcap');
    const pointList = Array.prototype.slice.call(points);

    /* 一个可动画的目标都没有：说明不是首页头版，直接放弃 */
    if (!title && !figure && !pointList.length) return null;

    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' } });
    const targets = [];

    function fadeInOne(el, step, extra) {
      const s = tune(step);
      const vars = {
        autoAlpha: 1,
        duration: s.duration
      };
      if (typeof s.y === 'number' && s.y > 0) vars.y = 0;
      tl.fromTo(el, { autoAlpha: 0, y: s.y }, vars, s.at);
      targets.push(el);
    }

    if (kicker) fadeInOne(kicker, MOTION.hero.kicker);
    if (title) fadeInOne(title, MOTION.hero.title);
    if (intro) fadeInOne(intro, MOTION.hero.intro);

    if (pointList.length) {
      const s = tune(MOTION.hero.points);
      tl.fromTo(pointList,
        { autoAlpha: 0, y: s.y },
        { autoAlpha: 1, y: 0, duration: s.duration, stagger: s.stagger },
        s.at);
      targets.push.apply(targets, pointList);
    }

    if (figure) fadeInOne(figure, MOTION.hero.figure);

    if (caption) {
      const s = tune(MOTION.hero.caption);
      tl.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: s.duration }, s.at);
      targets.push(caption);
    }

    /* 结束：清空行内样式（transform / opacity / visibility 三种都清），
       让元素的最终外观完全回到 CSS 定义，避免留下会被后续检查读到的内联样式 */
    tl.eventCallback('onComplete', function () {
      gsap.set(targets, { clearProps: 'transform,transformOrigin,opacity,visibility' });
    });

    return tl;
  }

  Object.assign(App, {
    heroEntrance: { build: build }
  });
})(window.AIKEPU = window.AIKEPU || {});
