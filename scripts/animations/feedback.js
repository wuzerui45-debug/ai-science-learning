/* =============================================================================
   scripts/animations/feedback.js —— 答题与交互反馈动画

   项目真实的答题机制（不再有“选择 → 提交”两步）：
     点击选项 = 立即判定（actions.js 的 answerJudge / answerQuiz）→
     写入 state.session → rerenderKeepScroll('#…-feedback-N')
     → 整个 #lessonBody 重建（选项带上 data-state，反馈块出现在同题下方）

   因此这里的动画全部发生在“重渲染之后”，只对新出现的节点做 fromTo：
     · 反馈块（.feedback，正确/错误共用）淡入 + 6px 上移
     · 同题被选中的选项：轻微缩放（1 → 1.015 → 1），✓ / ✗ 标记弹出
     · 一讲考完时新出现的成绩面板（.quiz-meter 所在的 .card）淡入
     · 生活场景展开时新增的说明块（.scene-item__body）淡入
     · 完成页的分数块只做 0.96 → 1 的缩放，**不对数字做滚动补间**

   状态判定完全基于 DOM 快照差异（对比上一次渲染），不读写任何业务状态：
     snapshot(view) → { ids: 反馈块 id, meter: 是否出现成绩面板, scene: 展开的场景序号 }
     run(view, before, after) → 只处理“这次新出现的”元素

   约束：只用 transform / opacity；✓/✗ 与颜色仍由 CSS 与文字承担（不只靠动画）；
   不做抖动、闪烁、颜色补间；结束后 clearProps，不残留行内样式。
   ============================================================================= */
(function (App) {
  'use strict';

  const { MOTION, isSenior } = App;

  const CLEAN = 'transform,transformOrigin,opacity,visibility';

  function dur(value) {
    return isSenior() ? value * 0.8 : value;
  }

  /* 当前视图的反馈快照：用于和上一次渲染做差集 */
  function snapshot(view) {
    if (!view) return { ids: [], meter: false, scene: -1 };
    const ids = Array.prototype.map.call(view.querySelectorAll('.feedback[id]'), function (el) { return el.id; });
    const scenes = Array.prototype.slice.call(view.querySelectorAll('.scene-item'));
    let scene = -1;
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].getAttribute('aria-expanded') === 'true') { scene = i; break; }
    }
    return {
      ids: ids,
      meter: !!view.querySelector('.quiz-meter'),
      scene: scene
    };
  }

  /* 同一道题里“用户选中的那个选项”：
     答错时是 data-state="wrong" 的那一行；答对时是 data-state="correct" 的那一行 */
  function chosenOption(item) {
    if (!item) return null;
    return item.querySelector('.option[data-state="wrong"]') ||
      item.querySelector('.option[data-state="correct"]');
  }

  /* 返回时间轴；没有任何新元素时返回 null */
  function run(view, before, after) {
    const gsap = window.gsap;
    if (!gsap || !view || !before || !after) return null;

    const senior = isSenior();
    const fresh = after.ids.filter(function (id) { return before.ids.indexOf(id) < 0; });
    const targets = [];
    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' } });
    let hasWork = false;

    /* 1) 新出现的反馈块 + 对应题目的选中选项 */
    fresh.forEach(function (id, i) {
      const fb = view.querySelector('#' + id);
      if (!fb) return;
      const y = senior ? 0 : MOTION.feedback.y;
      gsap.set(fb, { opacity: 0, y: y });          /* 先置起点，避免闪一下 */
      tl.to(fb, { opacity: 1, y: 0, duration: dur(MOTION.feedback.duration) }, i * 0.04);
      targets.push(fb);
      hasWork = true;

      const item = fb.closest ? fb.closest('.quiz-item') : null;
      const chosen = chosenOption(item);
      if (!chosen) return;

      /* 被选中的选项：轻微缩放（老年模式跳过，保持稳定） */
      if (!senior) {
        tl.to(chosen, {
          keyframes: [
            { scale: MOTION.feedback.optionScale, duration: MOTION.feedback.optionDuration, ease: 'power1.inOut' },
            { scale: 1, duration: MOTION.feedback.optionDuration, ease: 'power1.inOut' }
          ]
        }, 0);
        targets.push(chosen);
      }

      /* ✓ / ✗ 标记：从略小、透明到就位 */
      const flag = chosen.querySelector('.option__flag');
      if (flag) {
        tl.fromTo(flag,
          { scale: senior ? 0.92 : 0.78, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: dur(MOTION.feedback.flagDuration) },
          0);
        targets.push(flag);
      }
    });

    /* 2) 一讲考完：成绩面板首次出现 */
    if (after.meter && !before.meter) {
      const meter = view.querySelector('.quiz-meter');
      const panel = (meter && meter.closest ? meter.closest('.card') : null) || meter;
      if (panel) {
        gsap.set(panel, { opacity: 0, y: senior ? 0 : MOTION.feedback.panelY });
        tl.to(panel, { opacity: 1, y: 0, duration: dur(MOTION.feedback.panelDuration) }, 0.05);
        targets.push(panel);
        hasWork = true;
      }
    }

    /* 3) 生活场景展开：新出现的说明块 */
    if (after.scene >= 0 && after.scene !== before.scene) {
      const scenes = view.querySelectorAll('.scene-item');
      const body = scenes[after.scene] && scenes[after.scene].querySelector('.scene-item__body');
      if (body) {
        gsap.set(body, { opacity: 0, y: senior ? 0 : MOTION.feedback.sceneY });
        tl.to(body, { opacity: 1, y: 0, duration: dur(MOTION.feedback.duration) }, 0);
        targets.push(body);
        hasWork = true;
      }
    }

    if (!hasWork) return null;

    tl.eventCallback('onComplete', function () {
      gsap.set(targets, { clearProps: CLEAN });
    });
    return tl;
  }

  /* 完成页：分数块缩放进入（数字本身不做补间，避免让人误读成绩） */
  function resultPop(view) {
    const gsap = window.gsap;
    const num = view ? view.querySelector('.score-figure__num') : null;
    if (!gsap || !num) return null;
    const senior = isSenior();
    const from = senior ? 0.985 : MOTION.feedback.scoreScale;
    const tl = gsap.timeline({ defaults: { ease: MOTION.ease, overwrite: 'auto' } });
    tl.fromTo(num,
      { scale: from, transformOrigin: 'left center' },
      { scale: 1, duration: dur(MOTION.feedback.scoreDuration) },
      0);
    tl.eventCallback('onComplete', function () {
      gsap.set(num, { clearProps: 'transform,transformOrigin' });
    });
    return tl;
  }

  Object.assign(App, {
    feedbackMotion: { snapshot: snapshot, run: run, resultPop: resultPop }
  });
})(window.AIKEPU = window.AIKEPU || {});
