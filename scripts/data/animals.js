/* =============================================================================
   scripts/data/animals.js —— 动物分类交互实验的数据层

   本文件只放数据与插画，不含任何交互或状态：
     · FEATURES        六个可观察特征（耳朵三种、胡须、圆眼睛、大鼻子）
     · CLASSES         猫 / 狗 / 兔 三个类别
     · FEATURE_CLASSES 每个特征出现在哪些类别里（用于说明“能不能单独区分”）
     · TRAIN           每个类别六张**互不相同**的训练照片，每张都有自己的
                       imageId、特征与画法参数
     · TEST            四张独立测试照片（与 18 张训练照片都不重复）

   特征的依据是画面上真实画出来的东西：
     猫   尖耳朵 +（部分照片）胡须 +（部分照片）圆眼睛
     狗   垂耳朵 +（部分照片）圆眼睛 + 大鼻子
     兔   长耳朵 +（部分照片）胡须 + 大鼻子 +（部分照片）圆眼睛
   每组六张照片的特征并不完全一致，因此中间区域会如实显示出“六张都有”
   和“只有部分照片有”的差别，而不是给类别写一段固定文案。

   插画由参数化线稿函数生成：同一类别的六张照片在姿态、朝向、眼睛、胡须、
   花纹、尾巴等参数上各不相同，路径数据实际不同（不是换文件名或换标签）。
   ============================================================================= */
(function (App) {
  'use strict';

  /* ---------- 特征字典 ---------- */
  const FEATURES = [
    { key: 'pointedEars', c: '尖耳朵', s: '尖耳朵' },
    { key: 'floppyEars', c: '垂耳朵', s: '垂耳朵' },
    { key: 'longEars', c: '长耳朵', s: '长耳朵' },
    { key: 'whiskers', c: '胡须', s: '胡须' },
    { key: 'roundEyes', c: '圆眼睛', s: '圆眼睛' },
    { key: 'bigNose', c: '大鼻子', s: '大鼻子' }
  ];

  /* 特征与类别的关系：只有一个类别才有的特征，才能单独用来区分 */
  const FEATURE_CLASSES = {
    pointedEars: ['cat'],
    floppyEars: ['dog'],
    longEars: ['rabbit'],
    whiskers: ['cat', 'rabbit'],
    roundEyes: ['cat', 'dog', 'rabbit'],
    bigNose: ['dog', 'rabbit']
  };

  const CLASSES = [
    { id: 'cat', c: '猫', s: '猫', one: { c: '一只猫', s: '一只猫' }, tint: 'var(--art-2)' },
    { id: 'dog', c: '狗', s: '狗', one: { c: '一只狗', s: '一只狗' }, tint: 'var(--art-1)' },
    { id: 'rabbit', c: '兔', s: '兔', one: { c: '一只兔子', s: '一只兔子' }, tint: 'var(--art-3)' }
  ];

  /* ---------- 插画：统一的线稿风格 ---------- */
  const INK = 'var(--ink)';
  const SW = 2.2;
  const THIN = 1.6;
  const TINT = { cat: 'var(--art-2)', dog: 'var(--art-1)', rabbit: 'var(--art-3)' };

  function path(d, fill, w, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + INK + '" stroke-width="' +
      (w || SW) + '" stroke-linejoin="round" stroke-linecap="round"' + (extra || '') + '/>';
  }

  function circle(cx, cy, r, fill, w) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || 'none') +
      '" stroke="' + INK + '" stroke-width="' + (w || SW) + '"/>';
  }

  function svg(inner, label) {
    return '<svg class="hlab__art" viewBox="0 0 100 100" role="img" aria-label="' + label + '">' + inner + '</svg>';
  }

  /* 眼睛：睁着（圆眼睛特征）或眯起来（没有圆眼睛特征） */
  function eyes(kind, x1, x2, y, r) {
    if (kind === 'closed') {
      return '<path d="M' + (x1 - 5) + ' ' + y + ' q5 4.6 10 0 M' + (x2 - 5) + ' ' + y + ' q5 4.6 10 0" ' +
        'fill="none" stroke="' + INK + '" stroke-width="' + THIN + '" stroke-linecap="round"/>';
    }
    return circle(x1, y, r, 'none', 1.9) + circle(x1, y, r * 0.42, INK) +
      circle(x2, y, r, 'none', 1.9) + circle(x2, y, r * 0.42, INK);
  }

  /* 胡须：pairs 对（0 表示这张照片上看不到胡须） */
  function whiskers(pairs, y0, left, right) {
    if (!pairs) return '';
    let s = '';
    for (let i = 0; i < pairs; i++) {
      const y = y0 + i * 6;
      s += '<path d="M' + left + ' ' + y + ' h-12 M' + right + ' ' + y + ' h12" fill="none" stroke="' + INK +
        '" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>';
    }
    return s;
  }

  function wrap(inner, v) {
    const rot = v.rot || 0;
    const sc = v.sc || 1;
    const dx = v.dx || 0;
    const dy = v.dy || 0;
    return '<g transform="translate(50 54) rotate(' + rot + ') scale(' + sc + ') translate(' + (-50 + dx) + ' ' + (-54 + dy) + ')">' +
      inner + '</g>';
  }

  /* ---------- 猫 ---------- */
  function catArt(v) {
    const g = [];
    /* 尾巴（在头后面） */
    if (v.tail === 'up') g.push(path('M78 84 q13 -3 10 -17', 'none', 3.4));
    if (v.tail === 'curl') g.push(path('M76 86 q14 2 15 -8 q1 -8 -7 -6', 'none', 3.2));
    if (v.tail === 'down') g.push(path('M77 78 q12 6 10 18', 'none', 3.4));

    /* 头 + 耳朵 */
    const earH = v.ear || 1;
    const e1 = (20 - 4 * (earH - 1)).toFixed(1);
    const e2 = (22 - 4 * (earH - 1)).toFixed(1);
    g.push(path('M25 46 L' + (26 - 2 * (earH - 1)) + ' ' + e1 + ' L45 33 Q50 31 55 33 L' + (74 + 2 * (earH - 1)) + ' ' + e1 +
      ' L75 46 Q82 54 82 61 Q82 84 50 84 Q18 84 18 61 Q18 54 25 46 Z', TINT.cat));
    g.push(path('M31 41 l-1.4 -8 l7 5 M69 41 l1.4 -8 l-7 5', 'none', THIN));

    /* 花纹 */
    if (v.stripe >= 2) g.push(path('M44 36 l-2 7 M50 34 l0 8 M56 36 l2 7', 'none', 1.8, ' opacity=".55"'));
    if (v.stripe >= 3) g.push(path('M25 58 l-5 3 M25 65 l-5 2 M75 58 l5 3 M75 65 l5 2', 'none', 1.8, ' opacity=".55"'));

    /* 五官：猫是小鼻子（大鼻子不是猫的特征） */
    g.push(eyes(v.eyes, 39, 61, 58, 4.6));
    g.push(path('M50 66 l-4 3.6 h8 z', 'var(--clay)', 1.2));
    g.push(path('M50 69.6 q-3.6 4.4 -7 1.4 M50 69.6 q3.6 4.4 7 1.4', 'none', 1.5));
    g.push(whiskers(v.whisk, 60, 30, 70));
    if (v.collar) {
      g.push(path('M36 78 q14 8 28 0', 'none', 4, ' stroke="var(--blue)" stroke-width="4"'));
      g.push(circle(50, 85, 3.2, 'var(--amber)', 1.4));
    }
    return wrap(g.join(''), v);
  }

  /* ---------- 狗 ---------- */
  function dogArt(v) {
    const g = [];
    const len = v.ear === 'long' ? 1.14 : v.ear === 'short' ? 0.84 : 1;
    /* 垂耳朵：贴着脑袋两侧垂下来，长度随参数变化（长耳 / 短耳） */
    const earL = 'M27 38 C19 40 15 48 16 60 C17 69 22 72 26 68 C29 64 28 50 30 42 Z';
    const earR = 'M73 38 C81 40 85 48 84 60 C83 69 78 72 74 68 C71 64 72 50 70 42 Z';
    g.push('<g transform="translate(27 38) scale(1 ' + len + ') translate(-27 -38)">' + path(earL, TINT.dog) + '</g>');
    g.push('<g transform="translate(73 38) scale(1 ' + len + ') translate(-73 -38)">' + path(earR, TINT.dog) + '</g>');
    g.push(path('M27 36 q23 -13 46 0 q6 6 6 18 q0 26 -29 26 q-29 0 -29 -26 q0 -12 6 -18 z', TINT.dog));
    if (v.collar) {
      g.push(path('M31 76 q19 11 38 0', 'none', 4, ' stroke="var(--blue)" stroke-width="4.2"'));
      g.push(circle(50, 86, 3.2, 'var(--amber)', 1.4));
    }
    if (v.spots) {
      g.push('<ellipse cx="33" cy="61" rx="6.2" ry="4.4" fill="var(--amber)" opacity=".35"/>');
    }
    if (v.spots > 1) {
      g.push('<ellipse cx="68" cy="47" rx="4.6" ry="3.4" fill="var(--amber)" opacity=".35"/>');
    }
    g.push(eyes(v.eyes, 38, 62, 53, 4.4));
    g.push('<ellipse cx="50" cy="66" rx="8.8" ry="6.8" fill="var(--ink-3)" stroke="' + INK + '" stroke-width="2"/>');
    g.push('<ellipse cx="47" cy="64" rx="2.2" ry="1.5" fill="var(--paper-2)" opacity=".85"/>');
    g.push(path('M50 73 q-5 6.4 -10 4.4 M50 73 q5 6.4 10 4.4', 'none', 1.6));
    if (v.tongue) {
      g.push(path('M50 75 q5.4 9 0 11.4 q-5.4 -2.4 0 -11.4 z', 'var(--clay)', 1.3));
    }
    return wrap(g.join(''), v);
  }

  /* ---------- 兔 ---------- */
  function rabbitArt(v) {
    const g = [];
    const tilt = v.earTilt || 0;
    /* 长耳朵：从头顶往上 32px 左右，两耳可左右倾斜；耳内再画一条浅线 */
    g.push('<g transform="rotate(' + (-tilt) + ' 37 47)">' +
      path('M35 47 C33 33 33 19 36 13 C39 9 43 13 44 25 C45 34 45 42 44 47 Z', TINT.rabbit) +
      path('M38 44 C37 32 37 21 39 16 C40 20 40 32 40 44 Z', 'none', 1.2, ' opacity=".45"') + '</g>');
    g.push('<g transform="rotate(' + tilt + ' 63 47)">' +
      path('M65 47 C67 33 67 19 64 13 C61 9 57 13 56 25 C55 34 55 42 56 47 Z', TINT.rabbit) +
      path('M62 44 C63 32 63 21 61 16 C60 20 60 32 60 44 Z', 'none', 1.2, ' opacity=".45"') + '</g>');
    g.push(path('M29 51 q0 -15 21 -15 q21 0 21 15 q0 26 -21 26 q-21 0 -21 -26 z', TINT.rabbit));
    g.push(eyes(v.eyes, 41, 59, 56, 4.2));
    /* 鼻子：兔是大鼻子（实心椭圆），由参数决定是否画成小三角 */
    if (v.bigNose === false) {
      g.push(path('M50 64 l-3.4 3 h6.8 z', 'var(--clay)', 1.2));
    } else {
      g.push('<ellipse cx="50" cy="65" rx="6.2" ry="4.6" fill="var(--ink-3)" stroke="' + INK + '" stroke-width="1.8"/>');
    }
    g.push(path('M50 69 q-3 3.6 -6 1 M50 69 q3 3.6 6 1', 'none', 1.4));
    g.push(whiskers(v.whisk, 58, 33, 67));
    if (v.leaf) {
      g.push('<g transform="rotate(-18 70 76)">' +
        path('M70 70 q7 4 6 12 q-7 -1 -6 -12 z', 'var(--moss)', 1.4) + '</g>');
    }
    if (v.carrot) {
      g.push(path('M72 68 q6 3 5 11 q-6 0 -5 -11 z', 'var(--amber)', 1.4));
    }
    return wrap(g.join(''), v);
  }

  /* 模糊照片：只有圆眼睛看得清 */
  function blurArt(v) {
    return '<rect x="12" y="16" width="76" height="68" rx="4" fill="var(--paper-3)" stroke="var(--rule-2)" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<ellipse cx="50" cy="52" rx="27" ry="23" fill="var(--ink-3)" opacity=".16"/>' +
      '<ellipse cx="50" cy="52" rx="27" ry="23" fill="none" stroke="var(--rule-2)" stroke-width="2" stroke-dasharray="4 4"/>' +
      eyes('round', 40, 60, 49, 4.2) +
      '<path d="M33 69 q17 9 34 0" fill="none" stroke="var(--rule-2)" stroke-width="2" opacity=".55"/>' +
      '<path d="M20 26 l60 0" stroke="var(--rule-2)" stroke-width="1.4" opacity=".45"/>' +
      (v && v.mark ? '<text x="50" y="92" text-anchor="middle" font-size="8" fill="var(--ink-3)">对焦失败</text>' : '');
  }

  /* ---------- 训练照片：每类六张，参数各不相同 ---------- */
  const CAT_PARAMS = [
    { rot: 0, sc: 1, eyes: 'round', whisk: 3, stripe: 0, tail: '', ear: 1 },
    { rot: -6, sc: 0.98, eyes: 'round', whisk: 2, stripe: 2, tail: 'up', ear: 1.15 },
    { rot: 5, sc: 1.02, eyes: 'closed', whisk: 3, stripe: 0, tail: 'curl', ear: 0.9 },
    { rot: 0, sc: 0.86, eyes: 'round', whisk: 0, stripe: 0, tail: '', ear: 1.3, dy: 3 },
    { rot: -3, sc: 1, eyes: 'round', whisk: 3, stripe: 3, tail: 'down', ear: 1 },
    { rot: 4, sc: 1.05, eyes: 'closed', whisk: 0, stripe: 2, tail: '', ear: 0.85, dy: -2 }
  ];

  const DOG_PARAMS = [
    { rot: 0, sc: 1, eyes: 'round', ear: 'mid', spots: 0, tongue: false, collar: false },
    { rot: -5, sc: 0.98, eyes: 'round', ear: 'long', spots: 2, tongue: false, collar: false },
    { rot: 6, sc: 1.02, eyes: 'closed', ear: 'mid', spots: 0, tongue: true, collar: false },
    { rot: 0, sc: 1, eyes: 'round', ear: 'short', spots: 0, tongue: false, collar: true },
    { rot: -6, sc: 1.03, eyes: 'closed', ear: 'long', spots: 1, tongue: false, collar: false },
    { rot: 3, sc: 0.96, eyes: 'round', ear: 'mid', spots: 0, tongue: true, collar: false }
  ];

  const RABBIT_PARAMS = [
    { rot: 0, sc: 1, eyes: 'round', whisk: 3, earTilt: 0, leaf: false },
    { rot: -5, sc: 0.98, eyes: 'round', whisk: 2, earTilt: 3, leaf: true },
    { rot: 4, sc: 1.02, eyes: 'closed', whisk: 3, earTilt: -2, leaf: false },
    { rot: 7, sc: 0.95, eyes: 'round', whisk: 0, earTilt: 5, leaf: false },
    { rot: -4, sc: 1.04, eyes: 'round', whisk: 3, earTilt: -4, leaf: true },
    { rot: 2, sc: 0.99, eyes: 'closed', whisk: 0, earTilt: 2, leaf: false }
  ];

  function buildTrain() {
    const catFeatures = [
      ['pointedEars', 'whiskers', 'roundEyes'],
      ['pointedEars', 'whiskers', 'roundEyes'],
      ['pointedEars', 'whiskers'],
      ['pointedEars', 'roundEyes'],
      ['pointedEars', 'whiskers', 'roundEyes'],
      ['pointedEars']
    ];
    const dogFeatures = [
      ['floppyEars', 'roundEyes', 'bigNose'],
      ['floppyEars', 'roundEyes', 'bigNose'],
      ['floppyEars', 'bigNose'],
      ['floppyEars', 'roundEyes', 'bigNose'],
      ['floppyEars', 'bigNose'],
      ['floppyEars', 'roundEyes', 'bigNose']
    ];
    const rabbitFeatures = [
      ['longEars', 'whiskers', 'roundEyes', 'bigNose'],
      ['longEars', 'whiskers', 'roundEyes', 'bigNose'],
      ['longEars', 'whiskers', 'bigNose'],
      ['longEars', 'roundEyes', 'bigNose'],
      ['longEars', 'whiskers', 'roundEyes', 'bigNose'],
      ['longEars', 'bigNose']
    ];

    function item(kind, i, feats) {
      const n = i + 1;
      const id = 't-' + kind + '-' + n;
      const label = {
        c: (kind === 'cat' ? '猫' : kind === 'dog' ? '狗' : '兔') + '的照片 ' + n,
        s: (kind === 'cat' ? '猫' : kind === 'dog' ? '狗' : '兔') + ' · 训练照片 ' + n
      };
      const art = kind === 'cat' ? catArt(CAT_PARAMS[i]) : kind === 'dog' ? dogArt(DOG_PARAMS[i]) : rabbitArt(RABBIT_PARAMS[i]);
      return {
        id: id,
        classId: kind,
        index: n,
        features: feats.slice(),
        label: label,
        art: svg(art, label.c + '（' + feats.map(function (f) { return featureName(f); }).join('、') + '）')
      };
    }

    return {
      cat: catFeatures.map(function (f, i) { return item('cat', i, f); }),
      dog: dogFeatures.map(function (f, i) { return item('dog', i, f); }),
      rabbit: rabbitFeatures.map(function (f, i) { return item('rabbit', i, f); })
    };
  }

  function featureName(key) {
    for (let i = 0; i < FEATURES.length; i++) if (FEATURES[i].key === key) return FEATURES[i].c;
    return key;
  }

  /* ---------- 测试照片：与 18 张训练照片都不相同 ---------- */
  const TEST = [
    {
      id: 'x-cat-1', classId: 'cat', features: ['pointedEars', 'whiskers', 'roundEyes'],
      label: { c: '照片 1', s: '示例照片 1' },
      art: svg(catArt({ rot: 12, sc: 0.94, eyes: 'round', whisk: 2, stripe: 2, tail: 'up', ear: 1.2, collar: true, dx: -2 }),
        '测试照片：回头的猫，戴项圈')
    },
    {
      id: 'x-dog-1', classId: 'dog', features: ['floppyEars', 'bigNose', 'roundEyes'],
      label: { c: '照片 2', s: '示例照片 2' },
      art: svg(dogArt({ rot: -11, sc: 0.97, eyes: 'round', ear: 'long', spots: 1, tongue: true, collar: false }),
        '测试照片：歪着头、吐舌头的狗')
    },
    {
      id: 'x-rabbit-1', classId: 'rabbit', features: ['longEars', 'whiskers', 'bigNose', 'roundEyes'],
      label: { c: '照片 3', s: '示例照片 3' },
      art: svg(rabbitArt({ rot: -7, sc: 0.95, eyes: 'round', whisk: 3, earTilt: -5, leaf: true }),
        '测试照片：抱着叶子的兔子')
    },
    {
      id: 'x-blur-1', classId: 'unknown', features: ['roundEyes'],
      label: { c: '拍糊的照片', s: '示例照片 4（拍糊）' },
      art: svg(blurArt({ mark: true }), '测试照片：一张拍糊的照片，只看得清圆眼睛')
    }
  ];


  /* ---------- 界面文案（两种模式共用同一套规则，只改措辞） ---------- */
  const PANEL = {
    c: {
      cardKicker: '互动实验 · 猫 · 狗 · 兔',
      cardTitle: '机器真的认识猫吗？',
      cardDesc: '放入一张动物图片，看看机器会怎样判断它的身份。',
      cardTags: '猫 · 狗 · 兔 · 特征观察',
      cardCta: '开始探索',
      modalTitle: '机器是怎么认出一只猫的？',
      modalSub: '把照片拖进右边的虚线框，或点它选一张图片；三个框会同时更新。',
      closeLabel: '关闭',
      footNote: '教学模拟：判断规则来自每类六张训练照片的共同特征，不是真实神经网络。',
      title: '看图判断：训练样本 → 共同特征 → 模型识别',
      lead: '把照片拖进右边的蓝色虚线框，或点它选一张电脑里的图片；也可以拖下面的示例照片。放入后三个框同时更新。',
      samplesTitle: '训练样本',
      sixOfSix: '6 张',
      samplesCap: '判断参考了「{n}」这一类的六张训练照片。',
      samplesCapEmpty: '放入照片后，这里显示判断时参考的那一类训练照片。',
      samplesCapFile: '这张图片无法分析，没有使用训练样本。',
      samplesNote: '规则是事先从这六张总结的，不是刚刚训练。',
      featTitle: '共同特征',
      featEmpty: '放入照片后，这里列出这一类在六张训练照片里的特征分布。',
      featNoModel: '这张图片无法提取特征：当前没有图像识别模型。',
      featNote: '这是这一类的特征分布，判断分数就按它计算。',
      featUnique: '仅{n}',
      featShared: '{n}都有',
      testTitle: '模型识别',
      tagEmpty: '等待照片',
      tagReady: '已识别',
      zoneEmptyMain: '把照片拖到这里',
      zoneEmptySub: '或点这里选一张电脑里的图片',
      zoneSub: '换一张照片会马上重算',
      zoneChange: '换一张',
      samplesLabel: '示例照片（拖入或点击）',
      verdict: '判断：{n}',
      tie: '目前无法可靠区分',
      tieWhy: '照片里只有圆眼睛看得清，三个类别都有这个特征，分不开。',
      noMatch: '没有对上任何特征',
      noMatchWhy: '这张照片的特征和三类都不匹配，无法判断。',
      fileVerdict: '本地图片：无法识别',
      emptyVerdict: '还没有照片：拖一张进来，或点虚线框选图。',
      bestLine: '{n} {a}/{b} 全中：{f}',
      weakLine: '{n} {a}/{b}',
      sharedLine: '共有特征不能单独区分：{f}',
      noneShort: '无',
      fileNotice: '没有图像识别模型，无法判断这张图是什么动物。点下面的示例照片可以看到按特征计算的过程。',
      notComputed: '—',
      badFile: '请选择图片文件（jpg、png 等）。',
      localImage: '你的图片',
      limits: '教学模拟匹配分数：按事先设定的特征规则计算，不是真实的神经网络置信度或识别准确率。'
    },
    s: {
      cardKicker: '互动实验 · 猫 · 狗 · 兔',
      cardTitle: '机器真的认识猫吗？',
      cardDesc: '放入一张动物图片，查看机器如何判断它的类别。',
      cardTags: '猫 · 狗 · 兔 · 特征观察',
      cardCta: '开始探索',
      modalTitle: '机器是怎么认出一只猫的？',
      modalSub: '将照片拖入右侧虚线框，或点击它选择图片；三个框会同步更新。',
      closeLabel: '关闭',
      footNote: '教学模拟：判断规则来自每个类别六张训练照片的共同特征，并非真实神经网络。',
      title: '交互演示：训练样本 → 共同特征 → 模型识别',
      lead: '将照片拖入右侧蓝色虚线框，或点击它选择本地图片；也可拖入下方示例照片。放入后三个框同步更新。',
      samplesTitle: '训练样本',
      sixOfSix: '6 张',
      samplesCap: '判断参考了「{n}」类别的六张训练照片。',
      samplesCapEmpty: '放入照片后，此处显示判断所参考的那一类训练照片。',
      samplesCapFile: '该图片无法分析，未使用训练样本。',
      samplesNote: '规则事先由这六张总结得出，并非现场训练。',
      featTitle: '共同特征',
      featEmpty: '放入照片后，此处列出该类别在六张训练照片中的特征分布。',
      featNoModel: '该图片无法提取特征：当前没有图像识别模型。',
      featNote: '上表为该类别的特征分布，判断分数据此计算。',
      featUnique: '仅{n}',
      featShared: '{n}均有',
      testTitle: '模型识别',
      tagEmpty: '等待照片',
      tagReady: '已识别',
      zoneEmptyMain: '将照片拖入此虚线框',
      zoneEmptySub: '或点击此处选择本地图片',
      zoneSub: '更换照片后立即重新计算',
      zoneChange: '更换照片',
      samplesLabel: '示例照片（拖入或点击）',
      verdict: '判断：{n}',
      tie: '目前无法可靠区分',
      tieWhy: '照片中仅圆眼睛可辨认，三个类别均具有该特征，无法区分。',
      noMatch: '未匹配任何特征',
      noMatchWhy: '该照片的特征与三个类别均不匹配，无法判断。',
      fileVerdict: '本地图片：无法识别',
      emptyVerdict: '尚无照片：请拖入或点击虚线框选择图片。',
      bestLine: '{n} {a}/{b} 命中：{f}',
      weakLine: '{n} {a}/{b}',
      sharedLine: '共有特征不能单独用于区分：{f}',
      noneShort: '无',
      fileNotice: '没有图像识别模型，无法判断图片类别。点击下方示例照片可查看按特征计算的过程。',
      notComputed: '—',
      badFile: '请选择图片文件（jpg、png 等）。',
      localImage: '您的图片',
      limits: '教学模拟匹配分数：按事先设定的特征规则计算，不是真实的神经网络置信度或识别准确率。'
    }
  };

  const TRAIN = buildTrain();

  Object.assign(App, {
    LAB: {
      FEATURES: FEATURES,
      FEATURE_CLASSES: FEATURE_CLASSES,
      CLASSES: CLASSES,
      TRAIN: TRAIN,
      TEST: TEST,
      PANEL: PANEL,
      featureName: featureName
    }
  });
})(window.AIKEPU = window.AIKEPU || {});
