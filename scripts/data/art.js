/* =============================================================================
   scripts/data/art.js —— 内嵌 SVG 插画库（45 个场景，全部由代码绘制）
   原 index.html「第四部分」。插画基元与全部场景保持不变；缩略图开关改由本模块持有。
   说明：本文件是 ai-science-learning 模块化项目的组成部分，依赖顺序见 README.md。
   ============================================================================= */

(function (App) {
  'use strict';

  /* =====================================================================
     第四部分：内嵌 SVG 插画库
     全部插画由代码绘制，不依赖任何外部图片。
     视觉规则（与页面统一的编辑式科普语言）：
       · 线条统一为 2px 深墨绿细线，形状只用 4–8px 小圆角
       · 配色只用纸白、浅蓝、浅橙、浅绿四种底，取消装饰性光斑与星形
       · 文字标注直接排版，不再使用圆角标签底色
       · 说明文字改由页面图注承担，插画专注于解释知识过程
     ===================================================================== */
  /* 缩略图渲染开关：原实现在同一个作用域中直接读写，拆分后由插画模块自己持有，
     并通过 setCompactArt() 提供给课程数据模块切换（行为与原来一致）。 */
  let compactArt = false;
  function setCompactArt(value) { compactArt = value; }
  const LINE = 'var(--art-line)';
  const INK = 'var(--art-ink)';
  const CARD = 'var(--card)';
  const P1 = 'var(--art-1)';
  const P2 = 'var(--art-2)';
  const P3 = 'var(--art-3)';
  const BRAND = 'var(--brand)';
  const ACCENT = 'var(--accent)';
  const OK = 'var(--green)';
  const ROSE = 'var(--rose)';
  const SOFT = 'var(--bg-soft)';
  const SW = 2;                 /* 统一线宽 */

  /* ---------- 基础图元 ---------- */
  function box(x, y, w, h, r, fill, sw) {
    return `<rect class="s" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r == null ? 4 : Math.min(r, 8)}" fill="${fill || CARD}" stroke="${LINE}" stroke-width="${sw || SW}"/>`;
  }
  function line(x, y, w, h, fill, r) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h || 6}" rx="${r == null ? 2 : r}" fill="${fill || 'var(--line-strong)'}"/>`;
  }
  function txt(x, y, str, size, anchor, fill) {
    return `<text x="${x}" y="${y}" font-size="${size || 14}" text-anchor="${anchor || 'middle'}" fill="${fill || INK}" font-weight="600" font-family="inherit">${str}</text>`;
  }
  /* 背景光斑已取消：插画直接落在纸面上 */
  function bg() { return ''; }
  /* 标签改为直接排版的文字标注（无底色、无边框） */
  function tag(x, y, str, fill, size) {
    if (compactArt) return '';
    const fs = size || 14;
    return txt(x + (str.length * fs) / 2, y + fs, str, fs, 'middle', fill || INK);
  }
  function tagCenter(cx, y, str, fill, size) {
    if (compactArt) return '';
    const fs = size || 14;
    return txt(cx, y + fs, str, fs, 'middle', fill || INK);
  }
  function docLines(x, y, widths, gap) {
    return widths.map((w, i) => line(x, y + i * (gap || 15), w, 6, i === 0 ? BRAND : 'var(--line-strong)')).join('');
  }
  function wave(x, y, heights, gap, color) {
    return heights.map((h, i) =>
      `<rect x="${x + i * (gap || 9)}" y="${y - h / 2}" width="4" height="${h}" rx="1" fill="${color || BRAND}"/>`).join('');
  }
  function tick(cx, cy, s, color) {
    return `<path d="M ${cx - s * 0.5} ${cy} l ${s * 0.42} ${s * 0.46} l ${s * 0.95} -${s * 1.05}" fill="none" stroke="${color || OK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function crossMark(cx, cy, s, color) {
    return `<path d="M ${cx - s / 2} ${cy - s / 2} L ${cx + s / 2} ${cy + s / 2} M ${cx + s / 2} ${cy - s / 2} L ${cx - s / 2} ${cy + s / 2}" fill="none" stroke="${color || ROSE}" stroke-width="2" stroke-linecap="round"/>`;
  }
  function bubble(x, y, w, h, fill) {
    return `<g><rect class="s" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill || CARD}" stroke="${LINE}" stroke-width="${SW}"/>` +
      `<path d="M ${x + 20} ${y + h} l 0 14 l 16 -14" fill="${fill || CARD}" stroke="${LINE}" stroke-width="${SW}" stroke-linejoin="round"/></g>`;
  }
  function pillShape(x, y, w, h, fill) {
    return `<rect class="s" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill || CARD}" stroke="${LINE}" stroke-width="${SW}"/>`;
  }

  /* 机器人「小问」：儿童模式的引导角色（局部坐标 100 × 140） */
  function robot(x, y, s, opts) {
    const o = opts || {};
    const eye = o.think
      ? `<path d="M30 40 q6 -6 12 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M58 40 q6 -6 12 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
      : `<circle cx="36" cy="40" r="6.5" fill="${INK}"/><circle cx="64" cy="40" r="6.5" fill="${INK}"/>` +
        `<circle cx="38" cy="37.5" r="2" fill="${CARD}"/><circle cx="66" cy="37.5" r="2" fill="${CARD}"/>`;
    const arm = o.wave
      ? `<path d="M78 88 q16 -6 16 -26" fill="none" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/><circle cx="94" cy="58" r="7" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>`
      : `<path d="M78 88 q16 4 16 22" fill="none" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/><circle cx="94" cy="112" r="7" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>`;
    const face = `<rect class="s" x="34" y="84" width="32" height="24" rx="8" fill="${CARD}" stroke="${LINE}" stroke-width="1.4"/>` +
      `<path d="M40 96 q6 -7 10 0 q4 7 10 0" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<line x1="50" y1="16" x2="50" y2="5" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="50" cy="4" r="5.5" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4"/>` +
      box(18, 14, 64, 54, 20, CARD, 3) + eye +
      `<circle cx="27" cy="54" r="4.5" fill="${P2}"/><circle cx="73" cy="54" r="4.5" fill="${P2}"/>` +
      `<path d="M42 56 q8 8 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
      `<rect x="45" y="68" width="10" height="8" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/>` +
      box(22, 76, 56, 46, 16, P1, 3) + face +
      `<path d="M22 90 q-16 2 -16 24" fill="none" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/><circle cx="6" cy="118" r="7" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>` +
      arm +
      `<rect x="34" y="122" width="13" height="15" rx="6" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>` +
      `<rect x="53" y="122" width="13" height="15" rx="6" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>` +
      `</g>`;
  }

  /* 人物：老年友好模式的主角（局部坐标 100 × 140） */
  function person(x, y, s, opts) {
    const o = opts || {};
    const glasses = o.glasses === false ? '' :
      `<circle cx="42" cy="32" r="9" fill="none" stroke="${LINE}" stroke-width="2"/>` +
      `<circle cx="60" cy="32" r="9" fill="none" stroke="${LINE}" stroke-width="2"/>` +
      `<path d="M51 32 h0.5" stroke="${LINE}" stroke-width="2"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<rect x="41" y="44" width="18" height="42" rx="8" fill="${P1}" stroke="${LINE}" stroke-width="2"/>` +
      `<path class="s" d="M16 134 q0 -56 34 -56 q34 0 34 56 z" fill="${P1}" stroke="${LINE}" stroke-width="2"/>` +
      `<circle class="s" cx="50" cy="32" r="22" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>` +
      `<path d="M30 24 q20 -16 40 0 q-20 -6 -40 0 z" fill="${INK}" opacity="0.75"/>` +
      glasses +
      `<circle cx="42" cy="32" r="2.6" fill="${INK}"/><circle cx="60" cy="32" r="2.6" fill="${INK}"/>` +
      `<path d="M43 44 q7 6 14 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M42 84 l8 8 l8 -8" fill="none" stroke="${CARD}" stroke-width="2" stroke-linejoin="round"/>` +
      (o.card ? box(60, 86, 34, 26, 8, CARD, 3) + docLines(66, 93, [22, 16], 9) : '') +
      `</g>`;
  }

  /* ---------- 插画场景 ---------- */
  const ART = {
    /* 品牌标识：同一份知识（纸页）× 两种表达（两条文字行与暖橙标记） */
    logo: () => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">` +
      `<rect x="9" y="6" width="28" height="36" rx="3" fill="${P1}" stroke="${LINE}" stroke-width="2"/>` +
      `<rect x="13" y="10" width="28" height="36" rx="3" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>` +
      `<rect x="18" y="17" width="18" height="2.4" rx="1" fill="${BRAND}"/>` +
      `<rect x="18" y="24" width="12" height="2.4" rx="1" fill="${ACCENT}"/>` +
      `<rect x="18" y="31" width="16" height="2.4" rx="1" fill="${LINE}" opacity=".6"/>` +
      `<rect x="18" y="38" width="9" height="2.4" rx="1" fill="${LINE}" opacity=".6"/>` +
      `</svg>`,

    /* 首页主视觉：机器认出一只猫的完整过程（样本 → 特征 → 判断） */
    hero: () => {
      let s = '';
      const arrow = (x, y) => `<path d="M${x} ${y} h18" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M${x + 13} ${y - 4} l5 4 l-5 4" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      const catGlyph = (cx, cy, sc) =>
        `<g transform="translate(${cx} ${cy}) scale(${sc})">` +
        `<path d="M-11 -4 l1 -8 l6 4 q4 -1.6 8 0 l6 -4 l1 8 q2 3 2 6 q0 9 -13 9 q-13 0 -13 -9 q0 -3 2 -6 z" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>` +
        `<circle cx="-4" cy="2" r="1.6" fill="${INK}"/><circle cx="4" cy="2" r="1.6" fill="${INK}"/>` +
        `<path d="M-2 7 q2 1.6 4 0" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>` +
        `</g>`;

      /* 左：训练样本（较宽、位置居中） */
      s += box(6, 60, 118, 150, 4, CARD, SW);
      s += txt(65, 82, '训练样本', 13, 'middle', INK);
      s += line(20, 92, 90, 1, 'var(--line-strong)');
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          s += box(16 + c * 33, 102 + r * 46, 29, 36, 3, SOFT, 1.4);
          s += catGlyph(30 + c * 33, 121 + r * 46, 0.6);
        }
      }
      s += txt(65, 202, '看过的猫', 11, 'middle', 'var(--ink-3)');

      /* 中：共同特征（较窄、位置略低） */
      s += arrow(128, 140);
      s += box(150, 78, 76, 130, 4, CARD, SW);
      s += txt(188, 98, '共同特征', 12, 'middle', INK);
      s += line(160, 106, 56, 1, 'var(--line-strong)');
      /* 尖耳朵 */
      s += `<path d="M170 132 l8 -12 l8 12 z" fill="${P2}" stroke="${LINE}" stroke-width="${SW}" stroke-linejoin="round"/>`;
      s += txt(192, 134, '尖耳朵', 10, 'start', 'var(--ink-3)');
      /* 胡须 */
      s += `<path d="M170 156 h16 M170 162 h16 M170 168 h12" stroke="${LINE}" stroke-width="${SW}" stroke-linecap="round"/>`;
      s += txt(192, 164, '有胡须', 10, 'start', 'var(--ink-3)');
      /* 圆眼 */
      s += `<circle cx="178" cy="188" r="7" fill="none" stroke="${LINE}" stroke-width="${SW}"/><circle cx="178" cy="188" r="2.6" fill="${INK}"/>`;
      s += txt(192, 192, '圆眼睛', 10, 'start', 'var(--ink-3)');

      /* 右：新照片与判断结果（更宽更高） */
      s += arrow(230, 140);
      s += box(248, 34, 106, 192, 4, CARD, SW);
      s += txt(301, 56, '一张新照片', 13, 'middle', INK);
      s += line(260, 66, 82, 1, 'var(--line-strong)');
      s += box(260, 78, 82, 62, 3, SOFT, 1.4);
      s += catGlyph(301, 109, 1.05);
      s += `<rect x="262" y="80" width="78" height="58" rx="3" fill="none" stroke="${BRAND}" stroke-width="2" stroke-dasharray="5 4"/>`;
      s += txt(301, 158, '判断结果', 11, 'middle', 'var(--ink-3)');
      /* 判断分数条 */
      const bar = (y, w, label, val, fill) =>
        txt(258, y + 9, label, 11, 'start', INK) +
        `<rect x="280" y="${y}" width="44" height="9" rx="2" fill="none" stroke="${LINE}" stroke-width="1.2"/>` +
        `<rect x="281" y="${y + 1}" width="${Math.round(42 * w)}" height="7" rx="1" fill="${fill}"/>` +
        txt(352, y + 9, val, 10, 'end', 'var(--ink-3)');
      s += bar(172, 0.92, '猫', '92%', BRAND);
      s += bar(190, 0.06, '狗', '5%', ACCENT);
      s += bar(208, 0.03, '兔', '3%', 'var(--line-strong)');

      return artWrap(s, '插图：机器从训练样本中找出猫的共同特征，再对新照片给出判断');
    },

    /* 模式卡片插画 */
    mascotKid: () => artWrap(
      bg(50, 52, 46, 46, P2, 0.38) + robot(14, 8, 0.62, { wave: true }),
      '插画：机器人小问', '0 0 100 100'),

    mascotSenior: () => artWrap(
      bg(50, 52, 46, 46, P1, 0.4) + person(20, 10, 0.62, { glasses: true, card: true }),
      '插画：正在阅读知识卡片的长者', '0 0 100 100'),

    /* 第一课 */
    aiBasics: (m) => {
      let s = bg(180, 132, 146, 104, P1, 0.3);
      s += box(92, 30, 108, 202, 22, CARD, 3.2);
      s += box(104, 46, 84, 154, 12, SOFT, 2.4);
      s += line(136, 38, 20, 5, 'var(--line-strong)', 3);
      s += `<path class="s" d="M118 78 h14 M118 78 v14 M186 78 h-14 M186 78 v14 M118 190 h14 M118 190 v-14 M186 190 h-14 M186 190 v-14" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<circle cx="146" cy="120" r="28" fill="${P2}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<circle cx="137" cy="113" r="3.6" fill="${INK}"/><circle cx="155" cy="113" r="3.6" fill="${INK}"/>`;
      s += `<path d="M138 132 q8 8 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<circle cx="130" cy="124" r="3" fill="${ACCENT}" opacity=".7"/><circle cx="162" cy="124" r="3" fill="${ACCENT}" opacity=".7"/>`;
      s += tag(216, 96, m === 'child' ? '手机会认脸' : '人脸识别', P3, 15);
      s += tag(216, 146, m === 'child' ? '这就是 AI' : '从例子中学规律', P2, 15);
      return artWrap(s, '插画：手机通过人脸识别认出照片里的人');
    },

    threeSkills: () => {
      let s = '';
      /* 一条横向图带，三段不等宽、以竖线分隔（不是三张并排卡片） */
      s += box(12, 54, 336, 148, 4, CARD, SW);
      s += `<path d="M124 68 v120 M252 68 v120" stroke="var(--line-strong)" stroke-width="1.4"/>`;
      /* 看得懂：眼睛 */
      s += txt(68, 80, '看得懂', 14, 'middle', INK);
      s += `<ellipse class="s" cx="68" cy="132" rx="26" ry="17" fill="${SOFT}" stroke="${LINE}" stroke-width="${SW}"/>` +
        `<circle cx="68" cy="132" r="8" fill="${BRAND}"/>`;
      s += txt(68, 182, '认出照片里的猫', 11, 'middle', 'var(--ink-3)');
      /* 听得清：声波 */
      s += txt(188, 80, '听得清', 14, 'middle', INK);
      s += wave(160, 130, [16, 30, 44, 30, 16], 9, BRAND) +
        `<path d="M204 146 q14 -16 0 -32" fill="none" stroke="${ACCENT}" stroke-width="${SW}" stroke-linecap="round"/>`;
      s += txt(188, 182, '听懂你说的话', 11, 'middle', 'var(--ink-3)');
      /* 猜得准：预测曲线 */
      s += txt(304, 80, '猜得准', 14, 'middle', INK);
      s += `<polyline points="266,144 286,120 302,130 322,100 340,110" fill="none" stroke="${BRAND}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<circle cx="340" cy="110" r="5" fill="${ACCENT}"/>`;
      s += txt(304, 182, '推测可能的结果', 11, 'middle', 'var(--ink-3)');
      return artWrap(s, '插图：人工智能的三类能力，看得懂、听得清、猜得准');
    },

    rulesVsLearning: (m) => {
      let s = bg(180, 130, 152, 100, P1, 0.26);
      /* 左：固定规则 */
      s += box(14, 40, 140, 176, 18, CARD, 3);
      s += tagCenter(84, 52, m === 'child' ? '普通程序' : '普通程序：规则由人写', P1, 14);
      s += docLines(34, 96, [100, 84, 92, 60], 20);
      s += `<circle cx="122" cy="186" r="16" fill="${SOFT}" stroke="${LINE}" stroke-width="2"/><path d="M114 186 h16 M122 178 v16" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
      /* 右：从例子学规律 */
      s += box(206, 40, 140, 176, 18, CARD, 3);
      s += tagCenter(276, 52, m === 'child' ? '人工智能' : '人工智能：从数据学', P2, 14);
      const dots = [[234, 96], [258, 88], [282, 100], [246, 120], [272, 126], [300, 112], [318, 96]];
      s += dots.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>`).join('');
      s += `<path d="M232 148 q46 -22 92 0" fill="none" stroke="${BRAND}" stroke-width="2" stroke-dasharray="7 7"/>`;
      s += tick(276, 178, 22, OK);
      /* 中间箭头 */
      s += `<path d="M160 128 h34" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/><path d="M188 118 l12 10 l-12 10" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      return artWrap(s, '插画：普通程序按固定规则运行，人工智能从数据中学习规律');
    },

    myths: (m) => {
      let s = '';
      /* 三个误解改为纵向条目，用细线与叉号表示（不是三列并排卡片） */
      s += box(28, 34, 304, 190, 4, CARD, SW);
      const row = (y, label, sub) =>
        txt(48, y, label, 14, 'start', INK) +
        txt(190, y, sub, 13, 'start', 'var(--ink-3)') +
        crossMark(310, y - 5, 15, ROSE) +
        `<path d="M40 ${y + 16} h280" stroke="var(--line-strong)" stroke-width="1.2"/>`;
      s += row(70, '误解一', m === 'child' ? 'AI 像人一样有思想' : 'AI 像人一样有意识与感情');
      s += row(126, '误解二', m === 'child' ? 'AI 什么都会' : 'AI 无所不能');
      s += row(182, '误解三', m === 'child' ? '机器人就等于 AI' : '机器人等同于人工智能');
      return artWrap(s, '插图：关于人工智能的三个常见误解');
    },

    phoneFace: (m) => {
      let s = bg(180, 128, 140, 100, P1, 0.3);
      s += box(110, 26, 112, 208, 22, CARD, 3.2);
      s += box(122, 42, 88, 158, 12, SOFT, 2.4);
      s += `<circle cx="166" cy="112" r="30" fill="${P2}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<circle cx="156" cy="105" r="3.8" fill="${INK}"/><circle cx="176" cy="105" r="3.8" fill="${INK}"/>`;
      s += `<path d="M157 124 q9 8 18 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M166 82 q30 0 30 30" fill="none" stroke="${BRAND}" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round"/>`;
      s += tick(232, 66, 20, OK);
      return artWrap(s, '插画：手机相册通过人脸识别自动整理照片');
    },

    calculator: (m) => {
      let s = bg(180, 130, 132, 96, P3, 0.28);
      s += box(104, 30, 152, 200, 20, CARD, 3.2);
      s += box(120, 46, 120, 44, 10, SOFT, 3);
      s += txt(180, 76, '485', 26, 'middle', INK);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          s += box(122 + c * 40, 104 + r * 38, 32, 30, 8, r === 2 && c === 2 ? P2 : SOFT, 2.4);
        }
      }
      return artWrap(s, '插画：计算器按照固定规则运算');
    },

    voice: (m) => {
      let s = bg(180, 130, 140, 100, P1, 0.28);
      s += `<path class="s" d="M126 92 q0 -30 54 -30 q54 0 54 30 v76 q0 30 -54 30 q-54 0 -54 -30 z" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<ellipse cx="180" cy="92" rx="8" ry="20" fill="${P1}" stroke="${LINE}" stroke-width="2"/>`;
      s += wave(146, 150, [18, 34, 48, 34, 18], 12, BRAND);
      s += wave(228, 150, [22, 40, 26], 12, ACCENT);
      s += bubble(28, 40, 110, 52, P2) + docLines(44, 54, [70, 44], 14);
      return artWrap(s, '插画：智能音箱听懂说话并回应');
    },

    book: (m) => {
      let s = bg(180, 132, 138, 96, P2, 0.26);
      s += `<path class="s" d="M42 66 q68 -26 138 0 l0 128 q-70 -26 -138 0 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<line x1="180" y1="66" x2="180" y2="194" stroke="${LINE}" stroke-width="2"/>`;
      s += docLines(62, 96, [92, 78, 88, 60], 20);
      s += docLines(200, 96, [92, 84, 66], 20);
      s += `<path d="M180 66 v-18 l16 6 l16 -6 v18" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/>`;
      return artWrap(s, '插画：一本打开的书');
    },

    qrcode: (m) => {
      let s = bg(180, 128, 136, 100, P3, 0.28);
      s += box(96, 42, 168, 168, 18, CARD, 3.2);
      const finder = (x, y) => box(x, y, 42, 42, 8, CARD, 3) + `<rect x="${x + 11}" y="${y + 11}" width="20" height="20" rx="4" fill="${INK}"/>`;
      s += finder(112, 58) + finder(206, 58) + finder(112, 152);
      const cells = [[170, 66], [186, 82], [170, 106], [202, 106], [186, 138], [218, 138], [170, 170], [202, 170], [218, 186]];
      s += cells.map(p => `<rect x="${p[0]}" y="${p[1]}" width="14" height="14" rx="3" fill="${BRAND}"/>`).join('');
      s += `<line x1="96" y1="126" x2="264" y2="126" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`;
      return artWrap(s, '插画：手机扫描二维码');
    },

    map: (m) => {
      let s = bg(180, 130, 146, 100, P1, 0.26);
      s += box(36, 44, 288, 168, 18, CARD, 3);
      s += `<path d="M36 108 h288 M36 164 h288 M120 44 v168 M232 44 v168" stroke="${P1}" stroke-width="1.4" opacity=".8"/>`;
      s += `<path d="M70 186 q60 -20 74 -66 q14 -44 92 -46" fill="none" stroke="${BRAND}" stroke-width="1.4" stroke-dasharray="10 9" stroke-linecap="round"/>`;
      s += `<circle cx="70" cy="186" r="9" fill="${OK}"/><circle cx="236" cy="74" r="12" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4"/><circle cx="236" cy="74" r="4.5" fill="${CARD}"/>`;
      s += tag(196, 116, m === 'child' ? '大约 20 分钟' : '预计到达时间', P2, 14);
      return artWrap(s, '插画：地图导航预估到达时间');
    },

    learnExamples: (m) => {
      let s = bg(180, 130, 152, 102, P1, 0.24);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const x = 22 + c * 62, y = 52 + r * 62;
          s += box(x, y, 52, 52, 12, CARD, 2.8);
          s += `<path d="M${x + 26} ${y + 14} q11 0 11 11 q0 8 -6 14 q-2 3 -5 3 q-3 0 -5 -3 q-6 -6 -6 -14 q0 -11 11 -11 z" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>`;
          s += `<circle cx="${x + 21}" cy="${y + 24}" r="1.8" fill="${INK}"/><circle cx="${x + 31}" cy="${y + 24}" r="1.8" fill="${INK}"/>`;
        }
      }
      s += `<path d="M214 128 h34" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/><path d="M242 118 l12 10 l-12 10" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += box(262, 62, 84, 132, 16, P3, 3);
      s += txt(304, 104, '规律', 20, 'middle', INK);
      s += tick(304, 146, 24, OK);
      return artWrap(s, '插画：从许多例子中总结出规律');
    },

    labeled: (m) => {
      let s = bg(180, 130, 146, 100, P3, 0.28);
      s += box(40, 54, 128, 118, 16, CARD, 3) + `<path d="M70 118 q18 -30 34 0 q16 -30 34 0" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += tagCenter(104, 184, m === 'child' ? '这是猫' : '标注：是猫', P3, 14);
      s += box(196, 54, 128, 118, 16, CARD, 3) + `<rect x="230" y="88" width="60" height="48" rx="8" fill="${SOFT}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += tagCenter(260, 184, m === 'child' ? '这不是猫' : '标注：不是猫', P2, 14);
      s += crossMark(230, 96, 18, ROSE);
      return artWrap(s, '插画：为数据添加标注');
    },

    testSplit: (m) => {
      let s = bg(180, 130, 150, 100, P1, 0.26);
      s += box(20, 54, 140, 132, 18, CARD, 3);
      s += tagCenter(90, 66, m === 'child' ? '学习用的照片' : '训练数据', P1, 14);
      for (let i = 0; i < 6; i++) {
        s += `<circle cx="${44 + (i % 3) * 40}" cy="${112 + Math.floor(i / 3) * 42}" r="13" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>`;
      }
      s += box(200, 54, 140, 132, 18, CARD, 3);
      s += tagCenter(270, 66, m === 'child' ? '考试用的新照片' : '检验数据', P3, 14);
      for (let i = 0; i < 3; i++) {
        s += `<circle cx="${238 + i * 32}" cy="122" r="13" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/>`;
      }
      s += tick(270, 162, 20, OK);
      return artWrap(s, '插画：数据分为训练用与检验用两部分');
    },

    biasData: (m) => {
      let s = '';
      /* 三张大小不一的训练照片（不是等宽并排） */
      const photos = [[26, 50, 62, 62], [96, 58, 70, 70], [174, 46, 64, 58]];
      photos.forEach((p) => {
        s += box(p[0], p[1], p[2], p[3], 3, CARD, 1.4);
        s += `<circle cx="${p[0] + p[2] / 2}" cy="${p[1] + p[3] * 0.42}" r="11" fill="${P2}" stroke="${LINE}" stroke-width="1.2"/>`;
        s += `<circle cx="${p[0] + p[2] / 2 - 3.5}" cy="${p[1] + p[3] * 0.36}" r="1.6" fill="${INK}"/>` +
          `<circle cx="${p[0] + p[2] / 2 + 3.5}" cy="${p[1] + p[3] * 0.36}" r="1.6" fill="${INK}"/>`;
        s += line(p[0] + 8, p[1] + p[3] - 14, p[2] - 18, 5, 'var(--line-strong)');
      });
      /* 没见过的新情况 */
      s += box(210, 128, 118, 88, 4, CARD, SW);
      s += `<circle cx="269" cy="164" r="16" fill="none" stroke="${LINE}" stroke-width="${SW}"/>` + txt(269, 172, '?', 20, 'middle', BRAND);
      s += txt(269, 202, m === 'child' ? '它没见过夜晚的照片' : '训练数据缺少这一类', 11, 'middle', 'var(--ink-3)');
      return artWrap(s, '插图：只见过白天的照片，遇到夜晚照片就会出错');
    },

    /* 第二课互动场景 */
    parcel: (m) => {
      let s = bg(180, 132, 150, 96, P1, 0.26);
      s += `<rect x="20" y="176" width="320" height="18" rx="8" fill="${SOFT}" stroke="${LINE}" stroke-width="2"/>`;
      const parcel = (x, y, f) => box(x, y, 62, 50, 10, f, 3) + `<path d="M${x + 31} ${y} v50" stroke="${LINE}" stroke-width="1.4"/>`;
      s += parcel(44, 122, P2) + parcel(136, 122, P3) + parcel(228, 122, P1);
      s += `<path d="M120 78 l0 30" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/><circle cx="120" cy="74" r="7" fill="${ACCENT}"/>`;
      s += box(96, 40, 160, 34, 10, CARD, 2.8) + txt(176, 63, m === 'child' ? '看地址，分区域' : '按地址自动分区', 15, 'middle', INK);
      return artWrap(s, '插画：快递自动分拣');
    },

    keyboard: (m) => {
      let s = bg(180, 128, 132, 100, P3, 0.26);
      s += box(92, 30, 176, 200, 20, CARD, 3.2);
      s += box(106, 44, 148, 40, 10, SOFT, 3) + docLines(116, 56, [60, 40], 14);
      s += tag(106, 92, m === 'child' ? '猜你想打' : '联想词', P2, 13);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
          s += box(106 + c * 21, 132 + r * 26, 18, 20, 5, SOFT, 2);
        }
      }
      return artWrap(s, '插画：手机输入法的联想功能');
    },

    remote: (m) => {
      let s = bg(180, 130, 130, 100, P1, 0.26);
      s += box(128, 20, 104, 196, 22, CARD, 3.2);
      s += `<circle cx="180" cy="66" r="16" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4"/>` + txt(180, 72, '+', 20, 'middle', CARD);
      for (let i = 0; i < 3; i++) { s += box(146 + i * 30, 108, 24, 24, 7, SOFT, 2.2); }
      for (let i = 0; i < 3; i++) { s += box(146 + i * 30, 144, 24, 24, 7, SOFT, 2.2); }
      s += box(146, 182, 76, 30, 8, SOFT, 2.4);
      return artWrap(s, '插画：电视遥控器');
    },

    album: (m) => {
      let s = bg(180, 128, 142, 100, P2, 0.24);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const x = 54 + c * 106, y = 40 + r * 96;
          s += box(x, y, 92, 80, 12, CARD, 2.8);
          s += `<circle cx="${x + 46}" cy="${y + 30}" r="14" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/>`;
          s += `<path d="M${x + 22} ${y + 62} q24 -20 48 0" fill="${P3}" stroke="${LINE}" stroke-width="1.4"/>`;
        }
      }
      s += `<circle cx="240" cy="60" r="18" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4"/>`;
      return artWrap(s, '插画：相册自动挑出拍得好的照片');
    },

    /* 第三课 */
    assistDaily: (m) => {
      let s = bg(180, 132, 152, 102, P1, 0.24);
      s += `<path class="s" d="M104 122 l76 -58 l76 58 v88 h-152 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += box(150, 158, 60, 52, 8, P2, 3) + `<circle cx="180" cy="184" r="5" fill="${INK}"/>`;
      s += box(18, 52, 74, 74, 14, CARD, 3) + wave(34, 88, [12, 22, 32, 22, 12], 10, BRAND);
      s += box(268, 52, 74, 74, 14, CARD, 3) + `<path d="M286 106 q22 -26 40 0" fill="none" stroke="${BRAND}" stroke-width="2"/><circle cx="326" cy="102" r="7" fill="${ACCENT}"/>`;
      s += box(18, 148, 74, 74, 14, CARD, 3) + docLines(34, 172, [42, 32, 38], 16);
      s += box(268, 148, 74, 74, 14, CARD, 3) + `<polyline points="284,204 300,186 316,196 330,176" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
      return artWrap(s, '插画：人工智能在日常生活中的四类帮助');
    },

    medical: (m) => {
      let s = bg(180, 130, 150, 100, P3, 0.26);
      s += box(30, 40, 170, 150, 16, CARD, 3);
      s += `<path d="M70 150 q26 -66 52 -66 q26 0 52 66" fill="${SOFT}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += `<path d="M96 92 v56 M96 108 h-18 M96 108 h18 M96 132 h-22 M96 132 h22" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<circle cx="146" cy="104" r="13" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="5 5"/>`;
      s += person(224, 92, 0.72, { glasses: true, card: true });
      s += tick(300, 74, 20, OK);
      return artWrap(s, '插画：医生参考人工智能的影像提示做出判断');
    },

    voicemail: (m) => {
      let s = bg(180, 130, 148, 100, P1, 0.26);
      s += box(26, 62, 128, 132, 18, CARD, 3);
      s += wave(46, 128, [22, 46, 66, 46, 22], 16, BRAND);
      s += `<path d="M170 128 h34" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/><path d="M198 118 l12 10 l-12 10" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += box(216, 62, 120, 132, 18, CARD, 3);
      s += docLines(234, 92, [84, 70, 80, 52], 22);
      return artWrap(s, '插画：语音留言自动转换成文字');
    },

    chat: (m) => {
      let s = bg(180, 130, 148, 100, P2, 0.24);
      s += bubble(34, 46, 150, 58, CARD) + docLines(50, 62, [70, 96, 52], 15);
      s += bubble(176, 126, 150, 58, P1) + docLines(192, 142, [84, 110, 60], 15);
      return artWrap(s, '插画：智能客服与用户的对话');
    },

    translate: (m) => {
      let s = bg(180, 130, 146, 100, P3, 0.26);
      s += box(46, 40, 150, 180, 16, SOFT, 3);
      s += docLines(66, 70, [96, 110, 80, 100, 60], 24);
      s += box(180, 74, 136, 112, 18, CARD, 3.2);
      s += `<rect x="198" y="92" width="44" height="34" rx="8" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/><circle cx="220" cy="109" r="9" fill="${CARD}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += docLines(252, 98, [48, 34], 16);
      s += `<path d="M232 154 q22 -12 44 0" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>`;
      return artWrap(s, '插画：手机拍照翻译外文菜单');
    },

    light: (m) => {
      let s = bg(180, 128, 132, 100, P2, 0.24);
      s += `<path class="s" d="M130 40 h100 l-18 44 h-64 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<circle cx="180" cy="106" r="22" fill="${P2}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<path d="M156 152 l48 0 l-8 12 l-32 0 z" fill="${SOFT}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += wave(120, 176, [16, 30, 44, 30, 16], 14, BRAND);
      s += `<path d="M240 176 q30 -20 0 -40" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
      return artWrap(s, '插画：走廊声控灯');
    },

    recommend: (m) => {
      let s = '';
      s += box(24, 40, 312, 176, 4, CARD, SW);
      s += txt(44, 66, m === 'child' ? '根据你看过的内容' : '根据浏览记录推测', 12, 'start', 'var(--ink-3)');
      s += `<path d="M40 78 h280" stroke="var(--line-strong)" stroke-width="1.2"/>`;
      /* 三张不等宽的推荐位，中间一张为当前推荐 */
      const cards = [[44, 92, 96, SOFT], [152, 92, 74, P2], [238, 92, 82, SOFT]];
      cards.forEach((c, i) => {
        s += box(c[0], c[1], c[2], 84, 3, c[3], 1.4);
        s += `<circle cx="${c[0] + 20}" cy="${c[1] + 24}" r="11" fill="${P3}" stroke="${LINE}" stroke-width="1.2"/>`;
        s += line(c[0] + 12, c[1] + 46, c[2] - 30, 5, 'var(--line-strong)') +
          line(c[0] + 12, c[1] + 58, c[2] - 44, 5, 'var(--line-strong)');
        if (i === 1) { s += txt(c[0] + c[2] / 2, c[1] + 78, '推荐位', 9, 'middle', 'var(--ink-3)'); }
      });
      s += txt(44, 200, m === 'child' ? '它只是在猜你喜欢，不是替你决定' : '推荐来自统计推测，不等于最好的选择', 11, 'start', 'var(--ink-3)');
      return artWrap(s, '插图：应用根据浏览记录推荐内容');
    },

    aidLimit: (m) => {
      let s = bg(180, 130, 148, 100, P3, 0.24);
      s += box(58, 34, 210, 182, 18, CARD, 3.2);
      s += `<rect x="138" y="20" width="50" height="26" rx="8" fill="${P1}" stroke="${LINE}" stroke-width="2"/>`;
      const rows = [100, 140, 180];
      rows.forEach((y, i) => {
        s += `<circle cx="96" cy="${y - 6}" r="14" fill="${P3}" stroke="${LINE}" stroke-width="1.4"/>` + tick(96, y - 6, 16, OK);
        s += docLines(124, y - 16, [96 - i * 12, 60], 16);
      });
      return artWrap(s, '插画：使用人工智能的三条原则清单');
    },

    /* 第四课 */
    mistake: (m) => {
      let s = bg(180, 130, 150, 100, P2, 0.24);
      s += box(140, 40, 190, 130, 16, CARD, 3);
      s += docLines(162, 68, [130, 100, 118], 24);
      s += `<rect x="162" y="132" width="72" height="26" rx="8" fill="var(--rose-soft)" stroke="${ROSE}" stroke-width="1.4"/>` + txt(198, 152, m === 'child' ? '答错了' : '结果有误', 14, 'middle', ROSE);
      s += crossMark(300, 74, 26, ROSE);
      s += `<circle cx="86" cy="112" r="42" fill="${SOFT}" stroke="${LINE}" stroke-width="2"/>` + txt(86, 128, '?', 46, 'middle', BRAND);
      return artWrap(s, '插画：人工智能给出错误结果');
    },

    whyWrong: (m) => {
      let s = bg(180, 130, 152, 100, P1, 0.22);
      /* 文字在上、图示在下，四个小格各自使用局部坐标 */
      const cell = (x, y, label, icon) => box(x, y, 152, 84, 14, CARD, 2.8) +
        txt(x + 18, y + 30, label, 15, 'start', INK) +
        `<g transform="translate(${x + 16} ${y + 34})">${icon}</g>`;
      const few = `<circle cx="26" cy="26" r="11" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>` +
        `<circle cx="54" cy="26" r="11" fill="none" stroke="var(--line-strong)" stroke-width="1.4" stroke-dasharray="4 4"/>`;
      const skew = `<circle cx="16" cy="26" r="11" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>` +
        `<circle cx="42" cy="26" r="11" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>` +
        `<circle cx="68" cy="26" r="11" fill="none" stroke="var(--line-strong)" stroke-width="1.4" stroke-dasharray="4 4"/>`;
      const bad = `<circle cx="26" cy="26" r="11" fill="${P2}" stroke="${LINE}" stroke-width="1.4"/>` + crossMark(26, 26, 13, ROSE);
      const vague = `<circle cx="26" cy="26" r="13" fill="${SOFT}" stroke="${LINE}" stroke-width="1.4"/>` + txt(26, 33, '?', 19, 'middle', BRAND);
      s += cell(18, 34, m === 'child' ? '例子太少' : '数据不足', few);
      s += cell(190, 34, m === 'child' ? '例子太偏' : '数据偏差', skew);
      s += cell(18, 132, m === 'child' ? '数据有错' : '数据有错', bad);
      s += cell(190, 132, m === 'child' ? '问题没说清' : '描述不清', vague);
      return artWrap(s, '插画：人工智能出错的四类常见原因');
    },

    confident: (m) => {
      let s = bg(180, 130, 148, 100, P2, 0.24);
      s += bubble(40, 38, 210, 92, CARD) + docLines(60, 62, [150, 120, 90], 22);
      s += `<path d="M262 46 l30 52 h-60 z" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>` + txt(262, 88, '!', 24, 'middle', INK);
      s += `<path d="M120 160 q60 22 120 0" fill="none" stroke="${BRAND}" stroke-width="2" stroke-dasharray="8 8"/>`;
      s += tagCenter(180, 196, m === 'child' ? '说得肯定 ≠ 说得对' : '表达流畅不等于内容正确', P3, 15);
      return artWrap(s, '插画：语气肯定不代表内容正确');
    },

    verify: (m) => {
      let s = bg(180, 130, 146, 100, P3, 0.26);
      s += box(46, 40, 150, 176, 16, CARD, 3);
      s += docLines(72, 74, [100, 84, 96, 64], 24);
      s += `<circle cx="236" cy="112" r="46" fill="none" stroke="${BRAND}" stroke-width="1.4"/>`;
      s += `<path d="M270 148 l32 34" stroke="${BRAND}" stroke-width="3" stroke-linecap="round"/>`;
      s += box(200, 168, 110, 56, 14, P1, 3) + tick(228, 196, 20, OK) + txt(272, 202, m === 'child' ? '再查一次' : '官方核实', 14, 'middle', INK);
      return artWrap(s, '插画：用放大镜核对信息');
    },

    /* 第五课 */
    privacy: (m) => {
      let s = bg(180, 130, 146, 100, P1, 0.26);
      s += box(96, 92, 168, 116, 18, CARD, 3);
      s += `<path class="s" d="M132 92 v-18 a48 48 0 0 1 96 0 v18" fill="none" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/>`;
      s += `<rect x="156" y="130" width="48" height="40" rx="8" fill="${P2}" stroke="${LINE}" stroke-width="2"/><circle cx="180" cy="148" r="6" fill="${INK}"/>`;
      s += docLines(112, 182, [56, 40], 14);
      s += crossMark(248, 60, 30, ROSE);
      s += `<path d="M226 52 q22 -18 44 0" fill="none" stroke="${ROSE}" stroke-width="2" stroke-linecap="round"/>`;
      return artWrap(s, '插画：个人信息需要用锁保护');
    },

    antiFraud: (m) => {
      let s = bg(180, 130, 148, 100, P2, 0.24);
      s += box(120, 34, 116, 190, 20, CARD, 3.2);
      s += box(132, 50, 92, 156, 12, SOFT, 2.4);
      s += `<circle cx="178" cy="110" r="26" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/><circle cx="170" cy="104" r="3.4" fill="${INK}"/><circle cx="186" cy="104" r="3.4" fill="${INK}"/><path d="M170 120 q8 6 16 0" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
      s += wave(150, 166, [14, 26, 38, 26, 14], 12, BRAND);
      s += `<path d="M248 60 l34 58 h-68 z" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>` + txt(248, 106, '!', 26, 'middle', INK);
      s += `<path d="M60 190 q30 -40 60 -12" fill="none" stroke="${OK}" stroke-width="2" stroke-linecap="round"/><path d="M112 168 l12 10 l-14 8" fill="none" stroke="${OK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += tag(20, 62, m === 'child' ? '先挂断，再打回去' : '用原号码回拨核实', P3, 13);
      return artWrap(s, '插画：接到可疑电话时先回拨核实');
    },

    gift: (m) => {
      let s = bg(180, 130, 144, 100, P1, 0.24);
      s += box(150, 96, 150, 118, 16, CARD, 3);
      s += docLines(174, 124, [100, 78, 90], 22);
      s += `<rect x="174" y="176" width="100" height="26" rx="8" fill="${P1}" stroke="${LINE}" stroke-width="1.4"/>` + txt(224, 195, m === 'child' ? '填身份证号' : '填写身份证号', 13, 'middle', INK);
      s += box(60, 96, 80, 80, 12, P2, 3) + `<path d="M60 122 h80 M100 96 v80" stroke="${LINE}" stroke-width="2"/>` + `<path d="M100 96 q-26 -22 -34 -4 q-6 14 34 4 M100 96 q26 -22 34 -4 q6 14 -34 4" fill="${P3}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += crossMark(300, 66, 26, ROSE);
      return artWrap(s, '插画：要求填写身份证号的领奖链接属于诈骗');
    },

    study: (m) => {
      let s = bg(180, 130, 148, 100, P3, 0.26);
      s += `<path class="s" d="M52 84 q58 -22 118 0 l0 108 q-60 -22 -118 0 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += docLines(72, 112, [76, 62, 70], 20);
      s += `<path d="M204 66 l16 96 l20 -34 l18 22 z" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<circle cx="286" cy="76" r="34" fill="${CARD}" stroke="${LINE}" stroke-width="2"/><path d="M286 56 v22 l16 12" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
      return artWrap(s, '插画：使用人工智能辅助学习，注意休息');
    },

    ask: (m) => {
      let s = bg(180, 130, 146, 100, P1, 0.24);
      s += bubble(44, 46, 120, 54, CARD) + txt(104, 82, '?', 30, 'middle', BRAND);
      s += person(24, 116, 0.6, { glasses: true });
      s += person(238, 116, 0.6, { glasses: true });
      s += box(112, 116, 120, 84, 14, CARD, 3) + wave(134, 158, [14, 26, 40, 26, 14], 14, BRAND);
      return artWrap(s, '插画：遇到不会的操作时向家人求助');
    },

    medicine: (m) => {
      let s = bg(180, 130, 144, 100, P2, 0.24);
      s += `<g transform="rotate(-28 150 130)"><rect class="s" x="86" y="104" width="128" height="52" rx="8" fill="${CARD}" stroke="${LINE}" stroke-width="2"/><rect x="150" y="104" width="64" height="52" rx="8" fill="${P1}" stroke="${LINE}" stroke-width="2"/></g>`;
      s += box(232, 60, 96, 120, 14, CARD, 3) + docLines(250, 88, [60, 44, 56], 20);
      s += crossMark(280, 148, 22, ROSE);
      return artWrap(s, '插画：用药问题应咨询医生');
    },

    weather: (m) => {
      let s = bg(180, 128, 140, 100, P1, 0.26);
      s += `<circle cx="112" cy="92" r="34" fill="${P2}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<path d="M112 34 v-14 M112 164 v-14 M54 92 h-14 M170 92 h14 M72 52 l-10 -10 M152 132 l10 10 M152 52 l10 -10 M72 132 l-10 10" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path class="s" d="M156 160 q0 -30 34 -30 q10 -26 38 -18 q26 -14 44 12 q26 2 26 26 q0 22 -26 22 h-90 q-26 0 -26 -12 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      return artWrap(s, '插画：天气信息以官方预报为准');
    },

    /* 第五课：遇到问题的处理办法 */
    help: (m) => {
      let s = bg(180, 130, 146, 100, P1, 0.24);
      s += box(96, 40, 116, 176, 20, CARD, 3.2);
      s += box(108, 56, 92, 128, 12, SOFT, 2.4);
      s += txt(154, 128, '110', 34, 'middle', BRAND);
      s += `<circle cx="154" cy="80" r="11" fill="${P3}" stroke="${LINE}" stroke-width="1.4"/>`;
      s += `<path d="M108 188 h92" stroke="${LINE}" stroke-width="1.4"/>`;
      s += `<path class="s" d="M240 92 l40 -18 l40 18 v42 q0 40 -40 56 q-40 -16 -40 -56 z" fill="${P3}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += tick(280, 136, 26, OK);
      s += person(10, 84, 0.78, { glasses: true });
      return artWrap(s, '插画：遇到问题时告知家人或拨打 110');
    },

    /* 第五课：合理使用与休息 */
    studyTime: (m) => {
      let s = bg(180, 130, 148, 100, P3, 0.26);
      s += `<path class="s" d="M40 82 q58 -22 118 0 l0 106 q-60 -22 -118 0 z" fill="${CARD}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += docLines(60, 110, [76, 62, 70], 20);
      s += `<path d="M192 72 l14 90 l18 -32 l16 20 z" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<circle class="s" cx="286" cy="94" r="36" fill="${CARD}" stroke="${LINE}" stroke-width="2"/>`;
      s += `<path d="M286 72 v22 l16 12" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M44 204 q80 18 196 -6" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="8 8"/>`;
      return artWrap(s, '插画：使用辅助工具时注意休息');
    },

    /* 学习完成页 */
    summary: (m) => {
      let s = bg(180, 130, 140, 100, P3, 0.28);
      s += `<path class="s" d="M74 116 l106 -44 l106 44 l-106 44 z" fill="${P1}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<path d="M74 116 v34 l106 44 l106 -44 v-34" fill="${P2}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<path d="M286 116 v56" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/><circle cx="286" cy="180" r="9" fill="${ACCENT}" stroke="${LINE}" stroke-width="1.4"/>`;
      return artWrap(s, '插画：完成学习，获得一颗星星');
    },

    /* 通用兜底插画 */
    generic: () => artWrap(
      bg(180, 130, 140, 100, P1, 0.26) +
      box(120, 60, 120, 140, 18, CARD, 3) + docLines(142, 88, [76, 60, 70], 22),
      '插画：知识卡片'),
  };

  /* SVG 包装：插画本身对读屏软件隐藏，文字说明由外层容器提供 */
  function artWrap(inner, _label, viewBox) {
    return `<svg viewBox="${viewBox || '0 0 360 260'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /* 向 App 注册本模块对外提供的成员 */
  Object.assign(App, { ART, artWrap, setCompactArt });
})(window.AIKEPU = window.AIKEPU || {});
