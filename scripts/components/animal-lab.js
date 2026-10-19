/* =============================================================================
   scripts/components/animal-lab.js —— 首页右栏的三个框：训练样本 / 共同特征 / 判断结果

   位置：首页课程标题右侧（原来的 .masthead__aside），三个框横向并排，各是一个独立卡片。
   交互：把照片拖进最右侧「判断结果」框的蓝色虚线区，或点它选一张本地图片；
        放入后立即判断，三个框同时更新：
          · 左「训练样本」：判断时参考的那一类六张训练照片（规则来自它们，不是现场训练）
          · 中「共同特征」：这一类的特征统计（几张照片有、是否与其他类别共有）
          · 右「判断结果」：照片预览、猫/狗/兔三条分数、判定与解释
        没有“开始训练”这一步，也不需要先选类别。

   诚实性：项目里没有真正的图像识别模型。
     · 示例照片有预设的结构化特征，按**事先设定的教学规则**算分并解释；
     · 本地图片无法分析像素，只做预览，明确写出“无法判断”，不编造结果。

   教学规则：每类六张训练照片里至少四张都有的特征即该类的特征；
      raw(C) = 命中数 / 该类特征数，三类归一化成合计 100 的百分比；
      raw 最高并列 → “无法可靠区分”。分数只叫「教学模拟匹配分数」。
   ============================================================================= */
(function (App) {
  'use strict';

  const { esc, state: appState } = App;
  const D = App.LAB;
  const FEATURES = D.FEATURES;
  const CLASSES = D.CLASSES;
  const TRAIN = D.TRAIN;
  const TEST = D.TEST;
  const TEXT = D.PANEL;
  const FEATURE_CLASSES = D.FEATURE_CLASSES;

  const MAJORITY = 4;

  const lab = {
    kind: 'empty',                 /* empty | sample | file */
    sampleId: null,
    fileUrl: null,
    fileName: null,
    message: null,
    dragging: null,
    dragAt: 0
  };

  let bound = false;

  /* ---------- 文案 ---------- */
  function t() {
    return TEXT[appState.mode === 'senior' ? 's' : 'c'];
  }

  function senior() {
    return appState.mode === 'senior';
  }

  function fill(str, map) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) {
      return map && map[k] !== undefined ? map[k] : m;
    });
  }

  /* ---------- 数据 ---------- */
  function classOf(id) {
    for (let i = 0; i < CLASSES.length; i++) if (CLASSES[i].id === id) return CLASSES[i];
    return null;
  }

  function nameOf(id) {
    const c = classOf(id);
    return c ? (senior() ? c.s : c.c) : id;
  }

  function featureLabel(key) {
    for (let i = 0; i < FEATURES.length; i++) if (FEATURES[i].key === key) return senior() ? FEATURES[i].s : FEATURES[i].c;
    return key;
  }

  function sampleById(id) {
    for (let i = 0; i < TEST.length; i++) if (TEST[i].id === id) return TEST[i];
    return null;
  }

  /* 每一类的教学特征：六张训练照片里至少四张都有的特征 */
  function modelOf(classId) {
    const imgs = TRAIN[classId] || [];
    const count = {};
    imgs.forEach(function (img) {
      img.features.forEach(function (f) { count[f] = (count[f] || 0) + 1; });
    });
    const keys = FEATURES.map(function (f) { return f.key; })
      .filter(function (k) { return (count[k] || 0) >= MAJORITY; });
    return {
      classId: classId,
      features: keys,
      images: imgs
    };
  }

  function model() {
    const classes = {};
    CLASSES.forEach(function (c) { classes[c.id] = modelOf(c.id); });
    return classes;
  }

  /* 某一类六张照片的特征分布（中间框用） */
  function analyse(classId) {
    const imgs = TRAIN[classId] || [];
    const rows = FEATURES.map(function (f) {
      const has = imgs.map(function (img) { return img.features.indexOf(f.key) >= 0; });
      return {
        key: f.key,
        count: has.filter(Boolean).length,
        total: imgs.length,
        has: has,
        owners: FEATURE_CLASSES[f.key] || [],
        inModel: has.filter(Boolean).length >= MAJORITY
      };
    }).filter(function (r) { return r.count > 0; });
    rows.sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return FEATURES.map(function (f) { return f.key; }).indexOf(a.key) -
        FEATURES.map(function (f) { return f.key; }).indexOf(b.key);
    });
    return rows;
  }

  /* 把比例凑成合计 100 的整数（最大余数法） */
  function roundTo100(values) {
    const total = values.reduce(function (s, v) { return s + v; }, 0);
    if (total <= 0) return values.map(function () { return 0; });
    const scaled = values.map(function (v) { return (v / total) * 100; });
    const floors = scaled.map(function (v) { return Math.floor(v); });
    let rest = 100 - floors.reduce(function (s, v) { return s + v; }, 0);
    const order = scaled.map(function (v, i) { return { i: i, frac: v - Math.floor(v) }; })
      .sort(function (a, b) { return b.frac - a.frac || a.i - b.i; });
    const out = floors.slice();
    let k = 0;
    while (rest > 0 && order.length) {
      out[order[k % order.length].i] += 1;
      k++;
      rest--;
    }
    return out;
  }

  /* ---------- 计算：一张示例照片 → 三类的百分比 ---------- */
  function classify(item) {
    if (!item) return null;
    const m = model();
    const rows = CLASSES.map(function (c) {
      const cm = m[c.id];
      const matched = cm.features.filter(function (f) { return item.features.indexOf(f) >= 0; });
      return {
        classId: c.id,
        features: cm.features,
        matched: matched,
        missing: cm.features.filter(function (f) { return matched.indexOf(f) < 0; }),
        raw: cm.features.length ? matched.length / cm.features.length : 0
      };
    });

    const pcts = roundTo100(rows.map(function (r) { return r.raw; }));
    rows.forEach(function (r, i) { r.pct = pcts[i]; });

    const maxRaw = rows.reduce(function (mx, r) { return r.raw > mx ? r.raw : mx; }, -1);
    const top = rows.filter(function (r) { return Math.abs(r.raw - maxRaw) < 1e-9; });
    const tie = top.length > 1 && maxRaw > 0;

    if (tie) {
      const avg = Math.round(top.reduce(function (s, r) { return s + r.pct; }, 0) / top.length);
      let delta = 0;
      top.forEach(function (r) { delta += r.pct - avg; r.pct = avg; });
      const rest = rows.filter(function (r) { return top.indexOf(r) < 0; });
      if (rest.length) {
        rest.sort(function (a, b) { return b.pct - a.pct; });
        rest[0].pct += delta;
      } else {
        top[0].pct += delta;
      }
    }

    const best = rows.reduce(function (b, r) { return !b || r.raw > b.raw ? r : b; }, null);
    return {
      rows: rows,
      best: best && best.raw > 0 ? best : null,
      tie: tie,
      top: top,
      tieNames: top.map(function (r) { return nameOf(r.classId); }),
      noMatch: !best || best.raw === 0
    };
  }

  /* 左框与中框展示哪一类：优先最高分类别；并列时取第一个并列类别 */
  function focusClass(result) {
    if (!result) return null;
    if (result.best) return result.best.classId;
    if (result.tie && result.top.length) return result.top[0].classId;
    return null;
  }

  /* ---------- 状态 ---------- */
  function setMessage(text, tone) {
    lab.message = text ? { text: text, tone: tone || 'info' } : null;
  }

  function revokeUrl() {
    if (lab.fileUrl) {
      try { URL.revokeObjectURL(lab.fileUrl); } catch (e) { /* 忽略 */ }
      lab.fileUrl = null;
    }
  }

  function pickSample(id) {
    const item = sampleById(id);
    if (!item) return;
    revokeUrl();
    lab.kind = 'sample';
    lab.sampleId = id;
    lab.fileName = null;
    lab.dragging = null;
    setMessage(null);
    repaint('sample:' + id);
  }

  function loadFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type || '')) {
      setMessage(t().badFile, 'warn');
      repaint('zone');
      return;
    }
    revokeUrl();
    lab.kind = 'file';
    lab.sampleId = null;
    lab.fileName = file.name || t().localImage;
    lab.fileUrl = (window.URL && URL.createObjectURL) ? URL.createObjectURL(file) : null;
    lab.dragging = null;
    setMessage(null);
    repaint('zone');
  }

  function clearImage(focusKey) {
    revokeUrl();
    lab.kind = 'empty';
    lab.sampleId = null;
    lab.fileName = null;
    setMessage(null);
    repaint(focusKey || 'zone');
  }

  /* ---------- 渲染：三个框 ---------- */
  function head() {
    return '<h2 class="hlab__title" id="hlabTitle">' + esc(t().title) + '</h2>' +
      '<p class="hlab__lead">' + esc(t().lead) + '</p>';
  }

  /* 左框：判断参考的那一类六张训练照片 */
  function samplesBox(focus) {
    const imgs = focus ? (TRAIN[focus] || []) : [];
    let cells;
    if (imgs.length) {
      cells = '<ul class="hlab__cells">' + imgs.map(function (img) {
        return '<li class="hlab__cell" aria-hidden="true">' + img.art + '</li>';
      }).join('') + '</ul>';
    } else {
      let out = '';
      for (let i = 0; i < 6; i++) out += '<li class="hlab__cell hlab__cell--empty" aria-hidden="true"></li>';
      cells = '<ul class="hlab__cells">' + out + '</ul>';
    }
    const cap = focus ? fill(t().samplesCap, { n: nameOf(focus) })
      : (lab.kind === 'file' ? t().samplesCapFile : t().samplesCapEmpty);
    const note = focus && lab.kind === 'sample' ? '<p class="hlab__box-note">' + esc(t().samplesNote) + '</p>' : '';
    return '<div class="hlab__box hlab__box--samples">' +
      '<div class="hlab__box-head"><h3 class="hlab__box-title">' + esc(t().samplesTitle) + '</h3>' +
      '<span class="hlab__box-tag">' + (imgs.length ? t().sixOfSix : '0 / 6') + '</span></div>' +
      cells +
      '<p class="hlab__box-foot">' + esc(cap) + '</p>' + note +
      '</div>';
  }

  /* 中框：这一类的特征分布 */
  function featuresBox(focus) {
    let body;
    let tag = '—';
    if (focus) {
      const rows = analyse(focus);
      tag = rows.length + (senior() ? ' 项' : ' 个');
      body = '<ul class="hlab__feats">' + rows.map(function (row) {
        const unique = row.owners.length === 1;
        const owners = row.owners.map(nameOf).join('、');
        const label = unique ? fill(t().featUnique, { n: owners }) : fill(t().featShared, { n: owners });
        return '<li class="hlab__feat">' +
          '<span class="hlab__feat-name">' + esc(featureLabel(row.key)) + '</span>' +
          '<span class="hlab__feat-count">' + row.count + '/' + row.total + '</span>' +
          '<span class="hlab__feat-dots" aria-hidden="true">' + row.has.map(function (on) {
            return '<span class="hlab__dot' + (on ? ' is-on' : '') + '"></span>';
          }).join('') + '</span>' +
          '<span class="hlab__feat-tag' + (unique ? ' hlab__feat-tag--unique' : '') + '">' + esc(label) + '</span>' +
          '</li>';
      }).join('') + '</ul>';
      body += '<p class="hlab__box-note">' + esc(t().featNote) + '</p>';
    } else if (lab.kind === 'file') {
      body = '<p class="hlab__box-empty">' + esc(t().featNoModel) + '</p>';
    } else {
      body = '<p class="hlab__box-empty">' + esc(t().featEmpty) + '</p>';
    }
    return '<div class="hlab__box hlab__box--features">' +
      '<div class="hlab__box-head"><h3 class="hlab__box-title">' + esc(t().featTitle) + '</h3>' +
      '<span class="hlab__box-tag">' + esc(tag) + '</span></div>' +
      body + '</div>';
  }

  /* 右框：虚线接收区 + 三条结果 */
  function zoneBody() {
    if (lab.kind === 'sample') {
      const item = sampleById(lab.sampleId);
      return '<span class="hlab__shot" aria-hidden="true">' + (item ? item.art : '') + '</span>' +
        '<span class="hlab__zone-text"><strong>' + esc(item ? (senior() ? item.label.s : item.label.c) : '') + '</strong>' +
        '<span class="hlab__zone-sub">' + esc(t().zoneSub) + '</span></span>';
    }
    if (lab.kind === 'file') {
      const img = lab.fileUrl
        ? '<img class="hlab__shot hlab__shot--photo" src="' + esc(lab.fileUrl) + '" alt="' + esc(t().localImage) + '">'
        : '';
      return img + '<span class="hlab__zone-text"><strong>' + esc(lab.fileName || t().localImage) + '</strong>' +
        '<span class="hlab__zone-sub">' + esc(t().zoneSub) + '</span></span>';
    }
    return '<span class="hlab__zone-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 40 32" focusable="false">' +
      '<rect x="2" y="2" width="36" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4"/>' +
      '<circle cx="14" cy="13" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M6 26 l9 -9 l6 6 l4 -4 l8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>' +
      '<span class="hlab__zone-text"><strong>' + esc(t().zoneEmptyMain) + '</strong>' +
      '<span class="hlab__zone-sub">' + esc(t().zoneEmptySub) + '</span></span>';
  }

  function scoreRows(result) {
    return CLASSES.map(function (c) {
      const row = result ? result.rows.filter(function (r) { return r.classId === c.id; })[0] : null;
      const on = !!row;
      const pct = on ? row.pct : null;
      const label = on ? nameOf(c.id) + ' ' + pct + '%' : nameOf(c.id) + ' ' + t().notComputed;
      return '<li class="hlab__score" data-state="' + (on ? 'on' : 'off') + '">' +
        '<span class="hlab__score-name">' + esc(nameOf(c.id)) + '</span>' +
        '<span class="hlab__score-track" role="img" aria-label="' + esc(label) + '">' +
        '<span class="hlab__score-bar" data-flash-bar style="width:' + (on ? pct : 0) + '%"></span></span>' +
        '<span class="hlab__score-num">' + (on ? pct + '%' : esc(t().notComputed)) + '</span>' +
        '</li>';
    }).join('');
  }

  function verdictText(result) {
    if (lab.kind === 'file') return t().fileVerdict;
    if (!result) return t().emptyVerdict;
    if (result.tie) return t().tie;
    if (result.noMatch) return t().noMatch;
    return fill(t().verdict, { n: nameOf(result.best.classId) });
  }

  function explain(result) {
    if (lab.kind === 'file') return '<p class="hlab__explain">' + esc(t().fileNotice) + '</p>';
    if (!result) return '';
    const parts = [];
    if (result.tie) {
      parts.push('<p class="hlab__explain">' + esc(t().tieWhy) + '</p>');
    } else if (result.noMatch) {
      parts.push('<p class="hlab__explain">' + esc(t().noMatchWhy) + '</p>');
    } else {
      const best = result.best;
      parts.push('<p class="hlab__explain">' + esc(fill(t().bestLine, {
        n: nameOf(best.classId),
        a: best.matched.length,
        b: best.features.length,
        f: best.matched.map(featureLabel).join('、') || t().noneShort
      })) + '</p>');
      result.rows.filter(function (r) { return r.classId !== best.classId; }).forEach(function (r) {
        parts.push('<p class="hlab__explain hlab__explain--weak">' + esc(fill(t().weakLine, {
          n: nameOf(r.classId),
          a: r.matched.length,
          b: r.features.length
        })) + '</p>');
      });
      const sharedKeys = best.features.filter(function (f) { return (FEATURE_CLASSES[f] || []).length > 1; })
        .filter(function (f) { return best.matched.indexOf(f) >= 0; });
      if (sharedKeys.length) {
        parts.push('<p class="hlab__explain hlab__explain--note">' +
          esc(fill(t().sharedLine, { f: sharedKeys.map(featureLabel).join('、') })) + '</p>');
      }
    }
    return parts.join('');
  }

  function testBox(result) {
    const label = lab.kind === 'empty' ? t().zoneEmptyMain : t().zoneSub;
    return '<div class="hlab__box hlab__box--test">' +
      '<div class="hlab__box-head"><h3 class="hlab__box-title">' + esc(t().testTitle) + '</h3>' +
      '<span class="hlab__box-tag">' + esc(lab.kind === 'empty' ? t().tagEmpty : t().tagReady) + '</span></div>' +
      '<div class="hlab__zone" data-hlab-zone="drop" data-state="' + lab.kind + '" data-focus-id="zone" ' +
      'role="button" tabindex="0" aria-label="' + esc(label) + '">' + zoneBody() + '</div>' +
      '<input type="file" accept="image/*" class="hlab__file" id="hlabFile" data-hlab-file hidden>' +
      (lab.kind !== 'empty' ? '<button type="button" class="hlab__clear" data-hlab-act="clear">' + esc(t().zoneChange) + '</button>' : '') +
      '<ul class="hlab__score-list">' + scoreRows(result) + '</ul>' +
      '<p class="hlab__verdict">' + esc(verdictText(result)) + '</p>' +
      explain(result) +
      (lab.message ? '<p class="hlab__msg hlab__msg--' + lab.message.tone + '" role="status" aria-live="polite">' +
        esc(lab.message.text) + '</p>' : '') +
      '<p class="hlab__limits">' + esc(t().limits) + '</p>' +
      '</div>';
  }

  function sampleChip(item) {
    const active = lab.kind === 'sample' && lab.sampleId === item.id;
    return '<button type="button" class="hlab__chip" draggable="true" data-hlab-sample="' + item.id + '" ' +
      'data-focus-id="sample:' + item.id + '" aria-pressed="' + active + '">' +
      '<span class="hlab__chip-art" aria-hidden="true">' + item.art + '</span>' +
      '<span class="hlab__chip-name">' + esc(senior() ? item.label.s : item.label.c) + '</span>' +
      '</button>';
  }

  function samplesRow() {
    return '<div class="hlab__samples">' +
      '<p class="hlab__samples-label">' + esc(t().samplesLabel) + '</p>' +
      '<div class="hlab__chips">' + TEST.map(sampleChip).join('') + '</div>' +
      '</div>';
  }

  function inner() {
    const item = lab.kind === 'sample' ? sampleById(lab.sampleId) : null;
    const result = item ? classify(item) : null;
    const focus = focusClass(result);
    return head() +
      '<div class="hlab__flow">' + samplesBox(focus) + featuresBox(focus) + testBox(result) + '</div>' +
      samplesRow();
  }

  /* ---------- 轻量反馈 ---------- */
  function animate() {
    const gsap = window.gsap;
    if (!gsap || App.motionOff()) return;
    const root = document.getElementById('hlabRoot');
    if (!root) return;
    const bars = root.querySelectorAll('[data-flash-bar]');
    if (!bars.length) return;
    const ease = (App.MOTION && App.MOTION.ease) || 'power2.out';
    const tw = gsap.fromTo(bars, { scaleX: 0, transformOrigin: '0% 50%' },
      { scaleX: 1, duration: 0.38, stagger: 0.05, ease: ease });
    tw.eventCallback('onComplete', function () {
      try { gsap.set(bars, { clearProps: 'transform,transformOrigin,opacity' }); } catch (e) { /* 节点已换 */ }
    });
  }

  function repaint(focusKey) {
    const root = document.getElementById('hlabRoot');
    if (!root) return;
    root.innerHTML = inner();
    if (focusKey) {
      const el = root.querySelector('[data-focus-id="' + focusKey + '"]');
      if (el && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      }
    }
    if (lab.kind === 'sample') animate();
  }

  /* ---------- 交互 ---------- */
  function openPicker() {
    const input = document.getElementById('hlabFile');
    if (input && typeof input.click === 'function') input.click();
  }

  function onClick(e) {
    const root = e.target.closest ? e.target.closest('[data-hlab-root]') : null;
    if (!root) return;

    if (e.target.closest && e.target.closest('[data-hlab-act="clear"]')) { clearImage('zone'); return; }
    const chip = e.target.closest && e.target.closest('[data-hlab-sample]');
    if (chip) { pickSample(chip.getAttribute('data-hlab-sample')); return; }
    const zone = e.target.closest && e.target.closest('[data-hlab-zone="drop"]');
    if (zone) openPicker();
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const zone = e.target && e.target.getAttribute && e.target.getAttribute('data-hlab-zone');
    if (!zone) return;
    e.preventDefault();
    openPicker();
  }

  function onChange(e) {
    const input = e.target;
    if (!input || !input.hasAttribute || !input.hasAttribute('data-hlab-file')) return;
    const file = input.files && input.files[0];
    if (file) loadFile(file);
    try { input.value = ''; } catch (err) { /* 允许重复选同一张 */ }
  }

  function onDragStart(e) {
    const chip = e.target.closest && e.target.closest('[data-hlab-sample]');
    if (!chip) return;
    lab.dragging = chip.getAttribute('data-hlab-sample');
    lab.dragAt = Date.now();
    if (e.dataTransfer) {
      try {
        e.dataTransfer.setData('text/plain', lab.dragging);
        e.dataTransfer.effectAllowed = 'copy';
      } catch (err) { /* 某些浏览器限制 */ }
    }
  }

  /* 手抖 6px 就会被当成拖拽、click 不再触发：短促的拖拽按点击处理 */
  function onDragEnd() {
    const id = lab.dragging;
    const started = lab.dragAt || 0;
    lab.dragging = null;
    lab.dragAt = 0;
    if (!id) return;
    if (Date.now() - started < 260) pickSample(id);
  }

  function onDragOver(e) {
    const zone = e.target.closest && e.target.closest('[data-hlab-zone="drop"]');
    if (!zone) return;
    const types = e.dataTransfer && e.dataTransfer.types;
    const hasFiles = types && Array.prototype.indexOf.call(types, 'Files') >= 0;
    if (!lab.dragging && !hasFiles) return;
    e.preventDefault();
    if (e.dataTransfer) { try { e.dataTransfer.dropEffect = 'copy'; } catch (err) { /* 忽略 */ } }
    zone.setAttribute('data-over', 'true');
  }

  function onDragLeave(e) {
    const zone = e.target.closest && e.target.closest('[data-hlab-zone="drop"]');
    if (!zone) return;
    if (e.relatedTarget && zone.contains(e.relatedTarget)) return;
    zone.removeAttribute('data-over');
  }

  function onDrop(e) {
    const zone = e.target.closest && e.target.closest('[data-hlab-zone="drop"]');
    if (!zone) return;
    e.preventDefault();
    zone.removeAttribute('data-over');
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length) { loadFile(files[0]); return; }
    let id = lab.dragging;
    try { id = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || id; } catch (err) { /* 忽略 */ }
    lab.dragging = null;
    lab.dragAt = 0;
    if (id && sampleById(id)) pickSample(id);
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('change', onChange);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragend', onDragEnd);
  }

  /* ---------- 对外接口 ---------- */
  function mount() {
    const host = document.getElementById('hlabRoot');
    if (!host) return false;
    bind();
    host.innerHTML = inner();
    return true;
  }

  Object.assign(App, {
    animalLab: {
      mount: mount,
      state: lab,
      compute: {
        model: model,
        modelOf: modelOf,
        analyse: analyse,
        classify: classify,
        roundTo100: roundTo100,
        samples: function () { return TEST; }
      }
    }
  });
})(window.AIKEPU = window.AIKEPU || {});
