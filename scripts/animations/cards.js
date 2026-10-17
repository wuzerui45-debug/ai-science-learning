/* =============================================================================
   scripts/animations/cards.js —— 课程卡片的错开进入 + 桌面端悬停反馈

   真实存在的“课程卡片 / 学习入口”：
     · 首页五讲索引  #homeIndex .index-item        （5 个，JS 渲染）
     · 课程目录行    #coursesBody .lesson-item     （5 个，JS 渲染）

   两者都是整块重渲染生成的新节点，因此动画在渲染之后立刻创建，
   不会出现“先看见、再被拉回”的闪跳；也不隐藏整个课程区域，
   即使脚本失败，内容依旧可见（动画只是加在已有内容上的进场效果）。

   悬停反馈的约束（与既有设计规范保持一致）：
     · 只动 transform（y），颜色变化交给现有 CSS :hover，避免两套系统抢同一属性
     · 仅在 (hover: hover) and (pointer: fine) 的设备上启用，触屏不依赖 hover
     · 老年友好模式关闭位移；?motion=off 或系统减弱动效时整体不启用
     · 位移只有 2px，不改变布局占位，不影响点击区域
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, tune, motionOff, isSenior } = App;

  const CARD_SELECTOR = '.index-item, .lesson-item';
  let hovered = null;
  let hoverBound = false;      /* 监听只绑定一次，避免重复注册 */

  /* 当前视图里可见的卡片（最多 MAX 个，避免长列表收尾过久） */
  function cardsIn(view) {
    if (!view) return [];
    return Array.prototype.slice.call(view.querySelectorAll(CARD_SELECTOR))
      .filter(function (el) { return !el.hidden && el.getClientRects().length > 0; })
      .slice(0, MOTION.cards.max);
  }

  /* 卡片错开进入；delay 用于首屏（等主标题进入尾声） */
  function build(view, delay) {
    const gsap = window.gsap;
    const cards = cardsIn(view);
    if (!gsap || !cards.length) return null;

    const s = tune({ duration: MOTION.cards.duration, y: MOTION.cards.y, at: 0 });
    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' }, delay: delay || 0 });

    tl.fromTo(cards,
      { autoAlpha: 0, y: s.y },
      { autoAlpha: 1, y: 0, duration: s.duration, stagger: MOTION.cards.stagger },
      0);

    tl.eventCallback('onComplete', function () {
      gsap.set(cards, { clearProps: 'transform,transformOrigin,opacity,visibility' });
    });
    return tl;
  }

  /* ---------- 桌面端悬停 ---------- */
  function canHover() {
    if (motionOff() || isSenior()) return false;
    try {
      return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    } catch (err) {
      return false;
    }
  }

  function lift(el, y, done) {
    const gsap = window.gsap;
    if (!gsap || !el) return;
    const vars = {
      y: y,
      duration: done ? MOTION.hover.back : MOTION.hover.duration,
      ease: MOTION.ease,
      overwrite: 'auto'
    };
    /* 回到原位时清掉行内 transform，让元素完全回到 CSS 状态 */
    if (y === 0) vars.clearProps = 'transform';
    gsap.to(el, vars);
  }

  function onPointerOver(event) {
    if (!canHover()) return;
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    const card = target.closest(CARD_SELECTOR);
    if (!card || card === hovered) return;
    if (hovered) lift(hovered, 0, true);
    hovered = card;
    lift(card, MOTION.hover.lift, false);
  }

  function onPointerOut(event) {
    if (!hovered) return;
    /* 指针在同一张卡片内部移动时不做处理，避免抖动 */
    if (event.relatedTarget && hovered.contains(event.relatedTarget)) return;
    lift(hovered, 0, true);
    hovered = null;
  }

  function clearHover() {
    if (hovered) lift(hovered, 0, true);
    hovered = null;
  }

  function bindHover() {
    if (hoverBound) return;          /* 只绑定一次，避免重复注册监听 */
    if (!canHover()) return;
    hoverBound = true;
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });
    /* 页面切到后台或失焦时把悬停状态复位，避免残留位移 */
    window.addEventListener('blur', clearHover);
  }

  Object.assign(App, {
    cardMotion: { build: build, bindHover: bindHover, clearHover: clearHover }
  });
})(window.AIKEPU = window.AIKEPU || {});
