/* =============================================================================
   scripts/animations/motion.js —— 动画的统一调度与生命周期

   负责三类动画的“什么时候播、播完怎么收尾”：
     · 首屏进入（第一阶段）：init() 在首次渲染后调用一次
     · 课程卡片 / 内容切换（第二阶段）：afterRender(route) 在每次渲染后调用
     · 桌面端卡片悬停（第二阶段）：init() 里绑定一次，事件委托在 document 上

   关键约定：
     · 同一次页面加载只播一次首屏动画；返回首页不重播
     · 只在“路由真的变了”时做内容切换动画；作答 / 展开场景 / 切模式等
       同路由重渲染不参与（留给第三阶段）
     · 所有动画结束后 clearProps，DOM 回到 CSS 定义的状态（不残留行内样式）
     · ?motion=off、系统减弱动效、GSAP 缺失 时全部跳过，页面与加动画前完全一致
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, motionOff } = App;

  let played = false;          /* 首屏动画是否已处理过 */
  let timeline = null;         /* 首屏时间轴 */
  let lastRoute = null;        /* 上一次渲染的路由（用于判断是否真的切换了内容） */
  let sawFirstRender = false;  /* 是否已经历过首次渲染 */
  let lastSnap = null;         /* 上一次渲染的反馈快照（作答/展开/成绩面板的差集依据） */
  let scrollView = null;       /* 当前已建立滚动触发的视图；null 表示没有生效 */

  /* 解除预置隐藏：只在确实处于 pending 时才改写，
     这样 ?motion=off / 减少动态效果下不会在 <html> 上留下任何痕迹 */
  function release() {
    const d = document.documentElement;
    if (d.getAttribute('data-motion') === 'pending') d.setAttribute('data-motion', 'on');
  }

  function heroRoot() {
    const view = document.getElementById('view-home');
    if (!view || view.hidden) return null;
    return view.querySelector('.masthead');
  }

  function activeView() {
    return document.querySelector('.view:not([hidden])');
  }

  function viewNameOf(view) {
    return view ? view.getAttribute('data-view') : null;
  }

  function currentViewName() {
    const view = activeView();
    return view ? view.getAttribute('data-view') : null;
  }

  /* 让滚动触发的启用状态与当前条件保持一致：
       · 条件不满足（手机宽度 / 老年模式 / 关闭动画）→ 销毁并还原被隐藏的元素
       · 条件满足但换了视图，或强制刷新（断点变化）→ 重建
     这样窗口缩放、平板旋转、切换模式都不会留下“被隐藏但永不触发”的内容。 */
  function syncScroll(view, viewName, force) {
    if (!App.scrollMotion) return;
    if (!App.scrollMotion.supported()) {
      if (scrollView !== null) { App.scrollMotion.destroy(); scrollView = null; }
      return;
    }
    if (force || scrollView !== viewName) {
      App.scrollMotion.build(view, viewName);
      scrollView = viewName;
    }
  }

  function sig(route) {
    if (!route) return '';
    return [route.name || '', route.lessonId || 0, route.step || 0, route.sub || ''].join('|');
  }

  /* 路由变化时判断：是不是“同一讲内的步骤切换” */
  function isStepChange(prev, next) {
    return !!(prev && next &&
      prev.name === 'lesson' && next.name === 'lesson' &&
      prev.lessonId === next.lessonId &&
      prev.sub === 'step' && next.sub === 'step');
  }

  /* 本讲进度条应从上一进度的比例长到 1（只算前进方向，后退时不做缩放） */
  function stepRatio(prev, next) {
    const lesson = App.lessonById(next.lessonId);
    const total = lesson && lesson.steps ? lesson.steps.length : 0;
    if (!total) return 1;
    const prevPct = (Math.max(0, Number(prev.step) || 0) + 1) / total;
    const curPct = (Math.max(0, Number(next.step) || 0) + 1) / total;
    if (curPct <= 0) return 1;
    return Math.min(1, prevPct / curPct);
  }

  /* ---------- 每次渲染后调用（由 app-shell.js 的 render() 传入路由） ---------- */
  /* ---------- 实例清理：切换前先把上一轮动画收尾并销毁 ----------
     收尾（progress(1)）会触发各时间轴自己的 onComplete → clearProps，
     所以既不会在仍挂载的节点上留下半透明/位移，也不会让时间轴继续引用
     已经被 innerHTML 替换掉的旧节点。 */
  const live = [];

  function track(tl) {
    if (tl && typeof tl.kill === 'function') live.push(tl);
    return tl;
  }

  function finishAll() {
    while (live.length) {
      const tl = live.pop();
      try { tl.progress(1); } catch (err) { /* 已销毁的时间轴忽略 */ }
      try { tl.kill(); } catch (err) { /* 同上 */ }
    }
  }

  function afterRender(route) {
    if (App.cardMotion) App.cardMotion.clearHover();

    /* 上一轮动画先收尾并销毁，避免继续引用已卸载的 DOM */
    finishAll();

    const view = activeView();
    /* 反馈快照：与上一次渲染做差集，判断“这次新出现了什么” */
    const snap = (App.feedbackMotion && view) ? App.feedbackMotion.snapshot(view) : null;
    const beforeSnap = lastSnap;
    lastSnap = snap;

    /* 关闭动画时只记录状态，并把可能存在的滚动触发清理掉 */
    if (motionOff()) {
      if (App.scrollMotion) App.scrollMotion.destroy();
      lastRoute = route;
      return;
    }

    const prev = lastRoute;
    const changed = sig(prev) !== sig(route);
    lastRoute = route;

    /* 首屏动画若还在跑就让它直接到终点（清空行内样式），
       否则它可能与这次的内容切换动画抢同一批元素 */
    if (changed && timeline && timeline.progress() < 0.999) {
      try { timeline.progress(1); } catch (err) { /* 已销毁则忽略 */ }
    }

    /* 同路由重渲染（作答 / 展开场景 / 切模式）：只处理答题与交互反馈 */
    if (!changed) {
      if (view && snap && App.feedbackMotion) {
        track(App.feedbackMotion.run(view, beforeSnap, snap));
      }
      /* 切换模式（儿童 ↔ 老年）会走这里：条件不满足时要把滚动触发撤掉 */
      if (view) syncScroll(view, viewNameOf(view), false);
      return;
    }

    const isFirst = !sawFirstRender;
    sawFirstRender = true;

    if (!view) return;
    const viewName = view.getAttribute('data-view');

    /* 同一讲内翻步骤：头部不动，只过渡正文与插图 + 进度条 */
    if (!isFirst && isStepChange(prev, route) && App.contentMotion) {
      track(App.contentMotion.buildStep(document.getElementById('lessonBody'), stepRatio(prev, route)));
      return;
    }

    /* 换页面 / 换讲：内容块淡入 + 卡片错开 */
    if (!isFirst && App.contentMotion) track(App.contentMotion.build(view));

    const delay = (isFirst && viewName === 'home') ? MOTION.cards.heroDelay : 0;
    if (App.cardMotion) {
      track(App.cardMotion.build(view, delay));
      /* 首屏那次：非首页的深链也要给内容块一点淡入，避免只有卡片在动 */
      if (isFirst && viewName !== 'home' && App.contentMotion) track(App.contentMotion.build(view));
    } else if (isFirst && viewName !== 'home' && App.contentMotion) {
      track(App.contentMotion.build(view));
    }

    /* 完成页：分数块缩放进入（只动容器，数字文本不做补间） */
    if (route.name === 'result' && App.feedbackMotion) {
      track(App.feedbackMotion.resultPop(view));
    }

    /* 滚动触发（第四阶段）：只对首页 / 关于页的提示性区块，
       且仅在桌面宽度、非老年模式、未关闭动画时生效；离开页面时先清理再重建 */
    syncScroll(view, viewName, true);
  }

  function init() {
    if (played) return;
    played = true;

    /* 悬停反馈与首屏无关，先绑定（内部会自行判断设备与开关） */
    if (App.cardMotion) App.cardMotion.bindHover();

    if (motionOff()) { release(); return; }

    const root = heroRoot();
    if (!root) { release(); return; }        /* 首屏不在当前路由 */

    try {
      timeline = App.heroEntrance.build(root);
    } catch (err) {
      timeline = null;
    }
    if (!timeline) { release(); return; }

    /* 有开屏时，首屏时间轴先停在起点，等开屏退出阶段由 playHero() 接管，
       避免两套动画同时改同一批元素的 opacity / transform */
    if (App.splash && App.splash.willPlay && App.splash.willPlay()) {
      timeline.pause(0);
      /* 兜底：开屏若因异常没有调用 playHero()，6 秒后强制播完，内容不会停在上场状态 */
      try {
        window.gsap.delayedCall(6, function () {
          if (timeline && timeline.paused()) timeline.progress(1);
        });
      } catch (err) { /* 忽略 */ }
    }

    /* entrance.js 已经在 onComplete 里清空行内样式，这里接在它后面解除隐藏，
       不覆盖原有回调（eventCallback 无参调用用于读取当前回调） */
    const onDone = timeline.eventCallback('onComplete');
    timeline.eventCallback('onComplete', function () {
      if (typeof onDone === 'function') onDone();
      release();
    });
    timeline.eventCallback('onInterrupt', function () {
      release();
    });

    /* 窗口缩放 / 平板旋转跨越断点时，同步滚动触发的启用状态 */
    if (App.scrollMotion && window.matchMedia) {
      try {
        const mq = window.matchMedia('(min-width: 861px)');
        const onBreakpoint = function () { syncScroll(activeView(), currentViewName(), true); };
        if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onBreakpoint);
        else if (typeof mq.addListener === 'function') mq.addListener(onBreakpoint);
      } catch (err) { /* 老浏览器忽略 */ }
    }

    /* 页面切到后台时把动画推到终点，避免回到前台时停在半透明状态 */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && timeline) timeline.progress(1);
    }, { once: true });
  }

  /* 由开屏在退出阶段调用：把暂停中的首屏时间轴放行 */
  function playHero() {
    if (!timeline) return;
    if (timeline.paused()) timeline.play();
  }

  Object.assign(App, {
    motion: { init: init, afterRender: afterRender, playHero: playHero }
  });
})(window.AIKEPU = window.AIKEPU || {});
