/* =============================================================================
   scripts/actions.js —— 交互行为（统一 data-action 事件分发）
   模式切换、步骤切换、场景展开、答题判定、清空记录与键盘操作。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* 依赖：由前面的模块注册到 App 上，这里按名取用（顺序见 README.md） */
  const { $, MODES, PRAISE, UI, closeMenu, enterLesson, fill, go, isKid, isMenuOpen, lessonById, lessonHash, markDone, markVisited, persist, quizAnsweredCount, quizRightCount, recordOf, render, rerenderKeepScroll, resetLessonSession, resetProgress, setMenu, state, toast, ui } = App;

  /* =====================================================================
     第七部分：交互行为
     所有按钮通过统一的 data-action 分发处理，避免零散的事件绑定。
     ===================================================================== */

  let resetArmed = false;
  function goLesson(id, part) {
    const hash = lessonHash(id, part);
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  /* ---------- 模式切换：保留当前课程与步骤 ---------- */
  function switchMode(mode) {
    if (MODES.indexOf(mode) < 0) return;
    if (mode === state.mode) {
      toast('当前已经是' + UI[mode].modeName + '。');
      return;
    }
    state.mode = mode;
    persist();
    toast(UI[mode].toastModeSwitched);
    rerenderKeepScroll('#lessonBody h1, #coursesBody h1, #homeProgressText');
  }

  /* ---------- 大字阅读 ---------- */
  function toggleBigText() {
    if (state.mode !== 'senior') return;
    state.bigText = !state.bigText;
    persist();
    toast(state.bigText ? ui().toastBigTextOn : ui().toastBigTextOff);
    rerenderKeepScroll('#lessonBody .step-card h2, #lessonBody h1, #coursesBody h1');
  }

  /* ---------- 答题记录 ---------- */
  function praiseFor() {
    return PRAISE[Math.floor(Math.random() * PRAISE.length)];
  }

  function answerJudge(lessonId, qIndex, optIndex) {
    const lesson = lessonById(lessonId);
    if (!lesson || state.session.judge[qIndex]) return;
    const item = lesson.practice.judges[qIndex];
    const picked = item.options[optIndex];
    if (!picked) return;
    state.session.judge[qIndex] = {
      picked: optIndex,
      correct: picked.correct === true,
      praise: praiseFor()
    };
    rerenderKeepScroll('#judge-feedback-' + qIndex);
  }

  function answerQuiz(lessonId, qIndex, optIndex) {
    const lesson = lessonById(lessonId);
    if (!lesson || state.session.quiz[qIndex]) return;
    const item = lesson.quiz[qIndex];
    const picked = item.options[optIndex];
    if (!picked) return;
    state.session.quiz[qIndex] = {
      picked: optIndex,
      correct: picked.correct === true,
      praise: praiseFor()
    };
    if (quizAnsweredCount(lesson) === lesson.quiz.length) {
      markDone(lessonId, quizRightCount(lesson), lesson.quiz.length);
    }
    rerenderKeepScroll('#quiz-feedback-' + qIndex);
  }

  function retryQuiz(lessonId) {
    const lesson = lessonById(lessonId);
    state.session.quiz = {};
    state.session.quizIndex = 0;
    goLesson(lesson.id, 'quiz');
    if (window.location.hash === lessonHash(lesson.id, 'quiz')) {
      render();
      toast(ui().quizRetry + '：' + ui().quizIntro);
    }
  }

  /* ---------- 统一的事件分发 ---------- */
  function handleAction(trigger, event) {
    const action = trigger.getAttribute('data-action');
    const lessonAttr = trigger.getAttribute('data-lesson');
    const lessonId = lessonAttr ? Number(lessonAttr) : state.route.lessonId;
    const lesson = lessonById(lessonId);

    switch (action) {
      case 'toggle-menu': {
        setMenu(!isMenuOpen());
        break;
      }


      case 'enter-mode': {
        const mode = trigger.getAttribute('data-mode');
        if (MODES.indexOf(mode) >= 0) {
          state.mode = mode;
          persist();
        }
        go('courses');
        toast(UI[state.mode].toastModeSwitched);
        break;
      }

      case 'set-mode':
        switchMode(trigger.getAttribute('data-mode'));
        break;

      case 'toggle-bigtext':
        toggleBigText();
        break;

      case 'reset-progress': {
        if (!resetArmed) {
          resetArmed = true;
          trigger.textContent = isKid() ? '再点一次就清空' : '再点一次确认清空';
          toast(isKid() ? '再点一次，学习记录就清空啦。' : '再次点击即可清空全部学习记录。');
          window.setTimeout(() => {
            resetArmed = false;
            const btn = $('[data-action="reset-progress"]');
            if (btn) btn.textContent = isKid() ? '清空学习记录' : '清空学习记录';
          }, 5000);
        } else {
          resetArmed = false;
          resetProgress();
          toast(ui().toastProgressCleared);
          render();
        }
        break;
      }

      case 'open-lesson': {
        if (!lesson) break;
        enterLesson(lesson.id);
        const rec = recordOf(lesson.id);
        const wantResume = trigger.getAttribute('data-resume') === '1';
        const step = wantResume && rec ? rec.lastStep : 0;
        goLesson(lesson.id, Math.max(0, Math.min(lesson.steps.length - 1, step)));
        if (wantResume && rec && rec.lastStep > 0) {
          toast(fill(ui().resumeNotice, rec.lastStep + 1));
        }
        break;
      }

      case 'open-result': {
        if (!lesson) break;
        enterLesson(lesson.id);
        const answered = quizAnsweredCount(lesson);
        if (answered < lesson.quiz.length) toast(ui().toastLocked);
        goLesson(lesson.id, 'result');
        break;
      }

      case 'goto-step': {
        if (!lesson) break;
        const raw = Number(trigger.getAttribute('data-step'));
        if (trigger.getAttribute('data-next') === 'practice' || raw >= lesson.steps.length) {
          goLesson(lesson.id, 'practice');
          break;
        }
        const step = Math.max(0, Math.min(lesson.steps.length - 1, isFinite(raw) ? raw : 0));
        markVisited(lesson.id, step);
        goLesson(lesson.id, step);
        break;
      }

      case 'open-practice':
        if (lesson) goLesson(lesson.id, 'practice');
        break;

      case 'open-quiz':
        if (lesson) goLesson(lesson.id, 'quiz');
        break;

      case 'open-scene': {
        const index = Number(trigger.getAttribute('data-index'));
        state.session.openScene = state.session.openScene === index ? -1 : index;
        if (state.session.openScene === index) state.session.seen[index] = true;
        rerenderKeepScroll('[data-action="open-scene"][data-index="' + index + '"]');
        break;
      }

      case 'answer-judge':
        answerJudge(lessonId, Number(trigger.getAttribute('data-q')), Number(trigger.getAttribute('data-o')));
        break;

      case 'answer-quiz':
        answerQuiz(lessonId, Number(trigger.getAttribute('data-q')), Number(trigger.getAttribute('data-o')));
        break;

      case 'quiz-prev':
      case 'quiz-next': {
        if (!lesson) break;
        const delta = action === 'quiz-next' ? 1 : -1;
        const next = Math.max(0, Math.min(lesson.quiz.length - 1, (state.session.quizIndex || 0) + delta));
        state.session.quizIndex = next;
        render();
        const head = $('#lessonBody .question');
        if (head) {
          head.setAttribute('tabindex', '-1');
          head.focus({ preventScroll: true });
          head.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }

      case 'retry-quiz':
        if (lesson) retryQuiz(lesson.id);
        break;

      case 'relearn': {
        if (!lesson) break;
        const rec = recordOf(lesson.id);
        resetLessonSession(lesson.id);
        if (rec) {
          rec.visited = true;
          rec.lastStep = 0;
          persist();
        }
        goLesson(lesson.id, 0);
        toast(isKid() ? '我们从第一步重新开始吧！' : '已回到本课第一步。');
        break;
      }

      default:
        break;
    }
    if (event) event.preventDefault();
  }

  function onDocumentClick(event) {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    /* 点击导航链接或产品标识后收起手机端菜单（无论页面是否重新渲染） */
    if (target.closest('.nav') || target.closest('.brand')) closeMenu();
    const trigger = target.closest('[data-action]');
    if (!trigger) return;
    handleAction(trigger, event);
  }

  /* ---------- 键盘操作：Esc 收起菜单，左右方向键翻步骤 ---------- */
  function onKeyDown(event) {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      const btn = $('#menuBtn');
      if (btn && typeof btn.focus === 'function') btn.focus({ preventScroll: true });
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = (event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '');
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (state.route.name !== 'lesson' || state.route.sub !== 'step') return;
    const lesson = lessonById(state.route.lessonId);
    if (!lesson) return;
    const index = Number(state.route.step) || 0;
    if (event.key === 'ArrowRight' && index < lesson.steps.length - 1) {
      event.preventDefault();
      markVisited(lesson.id, index + 1);
      goLesson(lesson.id, index + 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      goLesson(lesson.id, index - 1);
    }
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { goLesson, switchMode, toggleBigText, praiseFor, answerJudge, answerQuiz, retryQuiz, handleAction, onDocumentClick, onKeyDown });
})(window.AIKEPU = window.AIKEPU || {});
