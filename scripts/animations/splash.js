/* =============================================================================
   scripts/animations/splash.js —— 开屏「知识点亮」

   播放时机（本次任务的核心要求）：
     · 只在「一次新的页面加载」时播放一次；由 main.js 的 init() 调用 play()
     · 切换儿童版 / 老年友好版、课程切换、答题、进度更新都不会再触发
       （开屏是 <body> 里的静态节点，不参与任何视图渲染，播完即从 DOM 移除）
     · prefers-reduced-motion 或 ?motion=off 时直接跳过，首页立即显示

   时间线（约 2.3 秒，全部用一条 gsap.timeline 管理）：
     0.00–0.66  连线逐条“画”出来（stroke-dasharray / dashoffset，位置固定不随机）
     0.05–0.60  节点依次淡入并轻微放大
     0.62–1.10  关键节点提亮，形成视觉中心（不发光、不闪烁）
     0.72–1.34  关键节点一次极轻的呼吸（scale 1 → 1.18 → 1）
     1.20–1.65  网站名称淡入并上移 10px
     1.34–1.74  标语紧随其后
     1.78–2.00  开屏文字先退场（避免与首页大标题叠在一起出现“重影”）
     1.88–2.22  遮罩淡出；1.98 起由首页首屏动画接管（交叠约 0.34 秒，不留空白帧）
     2.22       从 DOM 移除遮罩，页面回到正常的可见 / 可点 / 可滚状态

   与首页动画的衔接：init() 会用 playHero() 把首屏时间轴先暂停在起点，
   等这里在 1.98 秒调用 App.motion.playHero() 后才开始，因此不会出现
   “两套动画同时改同一个元素的 opacity/transform”，也不会重复淡入。
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, motionOff } = App;

  let played = false;        /* 本次页面加载是否已经处理过开屏 */
  let timeline = null;

  /* 是否跳过开屏：关闭动画 / ?splash=off（测试与调试用） */
  function skipped() {
    if (motionOff()) return true;
    return /(^|[?&])splash=off(&|$)/.test(window.location.search || '');
  }

  function node() {
    return document.getElementById('splash');
  }

  /* 是否将要播放：供 motion.init() 判断要不要先把首屏时间轴暂停 */
  function willPlay() {
    return !played && !skipped() && !!window.gsap && !!node();
  }

  /* 移除遮罩：无论正常播完、被跳过还是出错，都走这一个出口 */
  function remove() {
    const el = node();
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function play() {
    if (played) return false;
    played = true;

    if (!willPlayNow()) { remove(); return false; }

    const el = node();
    const gsap = window.gsap;
    const lines = Array.prototype.slice.call(el.querySelectorAll('.splash__lines line'));
    const dots = Array.prototype.slice.call(el.querySelectorAll('.splash__nodes circle'));
    const keys = Array.prototype.slice.call(el.querySelectorAll('.splash__node--key'));
    const name = el.querySelector('.splash__name');
    const tagline = el.querySelector('.splash__tagline');
    const inner = el.querySelector('.splash__inner');

    /* 每条连线按其真实长度设置虚线，保证“从起点画到终点”而不是整条闪现 */
    lines.forEach(function (line) {
      let len = 300;
      try { len = Math.ceil(line.getTotalLength()); } catch (err) { len = 300; }
      line.style.strokeDasharray = len + ' ' + len;
      line.style.strokeDashoffset = String(len);
    });

    timeline = gsap.timeline({
      defaults: { ease: MOTION.ease },
      onComplete: remove                      /* 播完立刻移出 DOM，不留遮罩 */
    });

    timeline
      /* 1) 连线逐条画出 + 节点按顺序出现 */
      .to(lines, {
        strokeDashoffset: 0,
        duration: 0.6,
        stagger: 0.045,
        ease: 'power1.inOut'
      }, 0)
      .from(dots, {
        scale: 0.4,
        opacity: 0,
        transformOrigin: '50% 50%',
        duration: 0.45,
        stagger: 0.045
      }, 0.05)
      /* 2) 关键节点提亮 + 一次极轻的呼吸 */
      .to(keys, { opacity: 1, duration: 0.3, stagger: 0.12 }, 0.62)
      .to(keys, {
        scale: 1.18,
        transformOrigin: '50% 50%',
        duration: 0.26,
        yoyo: true,
        repeat: 1,
        stagger: 0.1,
        ease: 'sine.inOut'
      }, 0.72)
      /* 3) 站名与标语 */
      .from(name, { opacity: 0, y: 10, duration: 0.45 }, 1.2)
      .from(tagline, { opacity: 0, y: 8, duration: 0.4 }, 1.34)
      /* 4) 退出：先让开屏文字退场（避免与首页的大标题重叠出现“重影”），
            再淡出遮罩，最后一刻把首屏动画放行，衔接时画面只剩背景过渡 */
      .to(inner, { opacity: 0, duration: 0.22, ease: 'power2.in' }, 1.78)
      .to(el, { opacity: 0, duration: 0.34, ease: 'power2.inOut' }, 1.88)
      .add(function () {
        if (App.motion && App.motion.playHero) App.motion.playHero();
      }, 1.98);

    return true;
  }

  /* willPlay() 里已把 played 置为 true 的场景要区分：这里只看“此刻还能不能播” */
  function willPlayNow() {
    if (!window.gsap) return false;
    if (skipped()) return false;
    const el = node();
    if (!el) return false;
    /* 播放前把 played 已经置位，所以不能再调用 willPlay() */
    return true;
  }

  Object.assign(App, {
    splash: { play: play, willPlay: willPlay, remove: remove }
  });
})(window.AIKEPU = window.AIKEPU || {});
