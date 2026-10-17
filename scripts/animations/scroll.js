/* =============================================================================
   scripts/animations/scroll.js —— 滚动触发动画（ScrollTrigger）

   为什么值得加：
     首页 2294px、关于页 1717px（1440×900 下约 2.5 / 1.9 屏），
     「两种读法」「一节课怎么学」「目标与差异」这几组内容在首屏之外，
     进入视口时轻微淡入能强化层次——但只做这一层，不做视差、不 pin、不接管滚动。

   只在「提示性区块」上使用，并且明确排除：
     · 课程正文 / 生活案例 / 插图（阅读内容，必须始终可见，动画会拖慢阅读）
     · 题目、选项、按钮所在的交互区（不能因为动画而延后可点）
     · 课程目录行与首页五讲索引（第二阶段已在进入时错开一次，避免重复播放）
     · 讲解页 / 练习页 / 测验页 / 完成页（每屏内容短，没有滚动场景）

   重复播放策略：once = true（只在首次进入视口时播放一次）；
     上下反复滚动不会重播，避免阅读时被打断。

   触发条件：≥861px 的桌面/平板、非老年友好模式、未关闭动画、ScrollTrigger 已加载。
   清理：每次路由切换先 destroy()（kill 全部 ScrollTrigger 并清空行内样式），再按需重建。
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, motionOff } = App;

  let groups = [];        /* 当前登记的组：{ els, triggers } */
  let registered = false;

  function supported() {
    if (motionOff()) return false;
    if (App.isSenior && App.isSenior()) return false;
    if (!window.gsap || !window.ScrollTrigger) return false;
    try {
      return window.matchMedia('(min-width: 861px)').matches;
    } catch (err) {
      return false;
    }
  }

  /* 每个视图允许的滚动区块（以真实 DOM 为准；没有对应元素时自然跳过） */
  function plan(viewName) {
    if (viewName === 'home') {
      return [
        { selector: '.read', y: 0, stagger: 0.08 },             /* 两个阅读入口：只淡入，不位移（块内含模式入口按钮） */
        { selector: '.steps-list > li', y: 8, stagger: 0.06 },  /* 一节课怎么学：三步轻微上移 */
        { selector: '.footnote', y: 0, stagger: 0 }
      ];
    }
    if (viewName === 'about') {
      return [{ selector: '.about-cols > *', y: 8, stagger: 0.08 }];
    }
    return [];
  }

  function register() {
    if (registered) return;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      registered = true;
    }
  }

  /* 清理：kill 触发器并把被隐藏的元素还原（离开页面/重建前调用） */
  function destroy() {
    const gsap = window.gsap;
    groups.forEach(function (group) {
      (group.triggers || []).forEach(function (st) {
        try { st.kill(); } catch (err) { /* 已销毁 */ }
      });
      if (gsap && group.els && group.els.length) {
        gsap.set(group.els, { clearProps: 'transform,transformOrigin,opacity' });
      }
    });
    groups = [];
  }

  function build(view, viewName) {
    destroy();
    if (!view || !supported()) return 0;
    register();
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    const created = [];

    plan(viewName).forEach(function (item) {
      const els = Array.prototype.slice.call(view.querySelectorAll(item.selector))
        .filter(function (el) { return el.getClientRects().length > 0; });
      if (!els.length) return;

      /* 先置为起点：这些区块在首屏之外，隐藏不会造成“内容突然消失” */
      gsap.set(els, { opacity: 0, y: item.y });

      const triggers = ST.batch(els, {
        start: MOTION.scroll.start,
        once: MOTION.scroll.once,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: MOTION.scroll.duration,
            stagger: item.stagger,
            ease: MOTION.ease,
            overwrite: true,
            clearProps: 'transform,transformOrigin,opacity'
          });
        }
      });
      created.push({ els: els, triggers: triggers });
    });

    groups = created;
    if (created.length) ST.refresh();     /* 让已在视口内的元素立即进入（不会被长期隐藏） */
    return created.reduce(function (n, g) { return n + (g.triggers ? g.triggers.length : 0); }, 0);
  }

  Object.assign(App, {
    scrollMotion: { build: build, destroy: destroy, supported: supported }
  });
})(window.AIKEPU = window.AIKEPU || {});
