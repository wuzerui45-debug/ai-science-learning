/* =============================================================================
   scripts/data/ui-text.js —— 界面文案字典（两种模式的措辞）
   原 index.html「第三部分」。含结论槽位、符号与鼓励语。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* =====================================================================
     第三部分：界面文案字典
     同一套功能，儿童模式与老年友好模式使用不同的措辞、语气与提示方式。
     ===================================================================== */
  const UI = {
    child: {
      modeName: '儿童探索模式',
      modeShort: '儿童',
      guideName: '小问',
      guideRole: '机器人小伙伴',
      /* 课程目录 */
      catalogTitle: '选一节课，和小问一起出发',
      catalogIntro: '一共五节课，每节课都有讲解、互动和小测验。学完一节课，就能收集一颗小星星。',
      catalogProgress: '你已经学完 %done% 节课，一共答对 %right% 道题。',
      catalogProgressEmpty: '还没有开始学习。建议从第一课开始，认识一下人工智能这位新朋友。',
      btnStart: '开始学习',
      btnResume: '继续学习',
      btnReview: '再学一次',
      btnOpen: '打开这一课',
      statusNew: '还没开始',
      statusDoing: '学到了第 %step% 步',
      statusDone: '已完成 · 答对 %right%/%total%',
      minutesLabel: '大约 %n% 分钟',
      stepCountLabel: '%n% 个小步骤',
      /* 课程学习页 */
      crumbCourses: '课程目录',
      stepLabel: '第 %now% 步 / 共 %total% 步',
      stepTitlePrefix: '小步骤',
      btnPractice: '去玩互动练习',
      btnQuiz: '开始小测验',
      btnPrev: '上一步',
      btnNext: '下一步',
      btnBackCatalog: '返回课程目录',
      btnHome: '回到首页',
      bigTextLabel: '大字阅读',
      switchTip: '换一种讲法',
      modeSwitchHint: '换成老年友好模式，同一节课会讲得更详细一些。',
      resumeNotice: '已经帮你回到上次学到的地方：第 %step% 步。',
      lastStepTip: '这是最后一步啦，做个小测验看看记住了多少！',
      /* 互动练习 */
      practiceTitle: '生活场景大侦探',
      practiceJudgeTitle: '快问快答',
      practiceOpen: '点我看看答案',
      practiceClose: '收起答案',
      practiceAnswered: '已经看过 %n% 个场景',
      judgeCorrect: '答对啦！',
      judgeWrong: '再想一想～',
      /* 小测验 */
      quizTitle: '课程小测验',
      quizIntro: '一共三道题。选一个答案，马上就知道对不对。',
      quizQuestionNo: '第 %n% 题',
      quizFlagRight: '✓ 答对',
      quizFlagWrong: '✗ 答错',
      quizPickedRight: '选得真好！',
      quizPickedWrong: '这个不对哦',
      quizAnsLabel: '答对',
      quizAnsweredLabel: '已答',
      quizTotalLabel: '题目总数',
      quizAllDone: '三道题都答完啦！',
      quizRetry: '重新答题',
      quizPrevQ: '上一题',
      quizNextQ: '下一题',
      quizToResult: '看看我的成绩',
      quizNeedMore: '把三道题都答完，就能看到成绩啦。',
      /* 学习完成页 */
      resultTitle: '这一课学完啦！',
      resultCongrats: '太棒了，你把《%title%》学完了。',
      resultScoreLabel: '答对题数',
      resultSummaryTitle: '这一课要记住的三件事',
      resultAllDone: '五节课全部完成，你已经是人工智能小专家啦！',
      btnRelearn: '重新学习',
      btnNextLesson: '继续下一课',
      btnAllDone: '做完了，回到目录',
      /* 通用 */
      toastModeSwitched: '已经换成儿童探索模式，同一节课讲得更轻松一些。',
      toastBigTextOn: '大字已打开',
      toastBigTextOff: '大字已关闭',
      toastProgressCleared: '学习记录已经清空，可以重新开始啦。',
      toastRoute: '这个页面地址找不到，先回到首页吧。',
      toastLocked: '还有题目没答完，先看看现在的成绩也可以～'
    },

    senior: {
      modeName: '老年友好模式',
      modeShort: '老年',
      guideName: '本课要点',
      guideRole: '要点提示',
      catalogTitle: '五节人工智能基础课',
      catalogIntro: '每节课包含分步讲解、生活场景判断和三道小测验，不限时间，可以随时停下来。',
      catalogProgress: '您已经完成 %done% 节课，累计答对 %right% 道题。',
      catalogProgressEmpty: '还没有开始学习。建议从第一课《什么是人工智能？》开始。',
      btnStart: '开始学习这一课',
      btnResume: '继续上次的进度',
      btnReview: '再复习一次',
      btnOpen: '打开课程',
      statusNew: '尚未开始',
      statusDoing: '学习到第 %step% 步',
      statusDone: '已完成 · 答对 %right%/%total% 题',
      minutesLabel: '约 %n% 分钟',
      stepCountLabel: '共 %n% 个步骤',
      crumbCourses: '课程目录',
      stepLabel: '第 %now% 步，共 %total% 步',
      stepTitlePrefix: '步骤',
      btnPractice: '进入互动练习',
      btnQuiz: '开始课程测验',
      btnPrev: '上一步',
      btnNext: '下一步',
      btnBackCatalog: '返回课程目录',
      btnHome: '返回首页',
      bigTextLabel: '大字阅读',
      switchTip: '切换模式',
      modeSwitchHint: '换成儿童探索模式，同一节课会用更简短的句子讲给孩子听。',
      resumeNotice: '已回到上次学习的位置：第 %step% 步。',
      lastStepTip: '这是本课最后一步，接下来可以做三道小题检查一下。',
      practiceTitle: '生活场景判断',
      practiceJudgeTitle: '快速判断',
      practiceOpen: '查看说明',
      practiceClose: '收起说明',
      practiceAnswered: '已查看 %n% 个场景的说明',
      judgeCorrect: '回答正确。',
      judgeWrong: '这个选项不对。',
      quizTitle: '课程测验',
      quizIntro: '一共三道题，都在下面。选择答案后会立刻显示结果和解释，不限时间。',
      quizQuestionNo: '第 %n% 题',
      quizFlagRight: '✓ 正确',
      quizFlagWrong: '✗ 错误',
      quizPickedRight: '回答正确。',
      quizPickedWrong: '这个选项不对。',
      quizAnsLabel: '答对',
      quizAnsweredLabel: '已答',
      quizTotalLabel: '题目总数',
      quizAllDone: '三道题已全部作答。',
      quizRetry: '重新答题',
      quizPrevQ: '上一题',
      quizNextQ: '下一题',
      quizToResult: '查看学习结果',
      quizNeedMore: '三道题全部作答后，即可查看成绩。',
      resultTitle: '本课学习完成',
      resultCongrats: '您已完成《%title%》的学习。',
      resultScoreLabel: '答对题数',
      resultSummaryTitle: '本课核心知识总结',
      resultAllDone: '五节课程已全部完成，感谢您的学习。',
      btnRelearn: '重新学习本课',
      btnNextLesson: '继续下一课',
      btnAllDone: '返回课程目录',
      toastModeSwitched: '已切换到老年友好模式：字号更大、对比更高。',
      toastBigTextOn: '大字阅读已打开，正文字号进一步放大。',
      toastBigTextOff: '大字阅读已关闭，恢复默认字号。',
      toastProgressCleared: '学习记录已清空。',
      toastRoute: '无法识别这个页面地址，已返回首页。',
      toastLocked: '还有题目没有作答，当前显示的是已完成部分的成绩。'
    }
  };

  /* 第 1—3 课的场景判断结论槽位（是否使用人工智能） */
  const DEFAULT_VERDICTS = {
    yes: { label: { c: '使用了人工智能', s: '使用了人工智能' }, tone: 'brand' },
    no: { label: { c: '没有使用人工智能', s: '没有使用人工智能' }, tone: 'plain' },
    maybe: { label: { c: '要看具体情况', s: '要看具体情况' }, tone: 'warn' }
  };

  /* 每个结论槽位对应的图标符号（不只依靠颜色传递信息） */
  const VERDICT_ICON = { yes: '✓', no: '—', maybe: '?' };

  /* 儿童模式的鼓励语（每次随机一句，避免机械重复） */
  const PRAISE = ['答对啦！你真棒', '太棒了，就是它！', '厉害！你答对了', '完全正确，你真会思考！'];

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { UI, DEFAULT_VERDICTS, VERDICT_ICON, PRAISE });
})(window.AIKEPU = window.AIKEPU || {});
