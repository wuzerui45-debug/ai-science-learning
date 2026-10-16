# 一份知识，两种表达 · 模块化版本（ai-science-learning）

面向不同人群的人工智能基础知识交互科普网页，**由单文件 `index.html` 重构而来的多文件项目**。
重构只改变代码组织方式：页面、课程、题目、反馈、导航、两种模式、字号切换、学习记录与视觉表现全部与原版一致（对照测试结果见 `模块映射与测试记录.md`）。

> **在线访问（GitHub Pages）**：<https://wuzerui45-debug.github.io/ai-science-learning/>
> 仓库地址：<https://github.com/wuzerui45-debug/ai-science-learning>（Public，分支 `main`）
> 部署方式与后续更新流程见文末「六、部署到 GitHub Pages 与后续更新」。

---

## 一、如何运行

### 方式一：双击打开（离线，无需服务器）

直接双击本目录下的 **`index.html`**，用 Chrome 或 Edge 打开即可。

- 全部样式与脚本都通过**相对路径**引用本目录内的文件，且都是普通 `<script>`／`<link>`，因此 `file://` 方式可以正常运行（这一点经过实测，见测试记录）。
- 不需要联网，不加载任何外部字体、图片或第三方库。

> 为什么没有用 ES Modules：`type="module"` 在 `file://` 下会被浏览器按跨源请求拦截，双击打开就会白屏。原项目的要求是"离线、双击可用"，因此这里使用**传统脚本 + 单一命名空间 `window.AIKEPU`**，既保留了离线运行，又实现了文件级的模块拆分。

### 方式二：本地 HTTP 服务器（推荐用于手机预览或二次开发）

```powershell
# 在本目录的上一级执行（即包含 ai-science-learning 的目录）
python -m http.server 8123
# 浏览器打开 http://127.0.0.1:8123/ai-science-learning/index.html
```

也可以直接双击本目录下的 **`启动本地服务器.bat`**（Windows，需已安装 Python）。

两种方式渲染结果一致：对照测试中 `file://` 与 `http://` 下的 DOM、样式与交互均通过检查。

---

## 二、目录结构

```text
ai-science-learning/
├── index.html                     页面骨架：顶栏、首页、各视图容器、关于页、页脚；按顺序引用样式与脚本
├── README.md                      本文件
├── 模块映射与测试记录.md          原功能与新模块的映射表、测试记录、已知问题与兼容性说明
├── 启动本地服务器.bat             可选：一键启动本地 HTTP 服务
├── styles/                        样式（按原内联样式表的分区拆分，加载顺序与原文件完全一致）
│   ├── variables.css              设计变量（:root 令牌：纸白、墨绿、强调色、圆角、字体）
│   ├── modes.css                  两种模式与大字阅读的主题令牌
│   ├── base.css                   基础排版（元素与文字层级）
│   ├── components.css             通用组件（按钮、标签、进度、插图占位、提示条、图注）
│   ├── layout.css                 页面版式（顶栏、首页、课程目录、课程学习页）
│   ├── interactions.css           互动练习、小测验、学习完成页、关于项目、页脚
│   └── responsive.css             响应式（≤1080px / ≤860px / ≤768px / ≤480px 与减弱动效）
└── scripts/                       脚本（按依赖顺序加载，共 22 个模块）
    ├── data/                      内容数据
    │   ├── courses-1.js           第 1—2 课（讲解、案例、场景、题目、总结）
    │   ├── courses-2.js           第 3—5 课
    │   ├── ui-text.js             界面文案字典（儿童版 / 老年版两套措辞）
    │   ├── art.js                 内嵌 SVG 插画库：45 个场景 + 绘图基元
    │   └── captions.js            插画图注（图 N · 说明）
    ├── state/
    │   ├── app-state.js           应用状态对象、模式常量、存储键名、课程数据整合
    │   └── session.js             课程会话状态（切课时的重置）
    ├── utils/
    │   ├── dom.js                 $ / $$ / esc / fill / toast
    │   └── text.js                双模式文案取值（tx / ui / isKid）
    ├── services/
    │   ├── storage.js             localStorage 读写（键名与格式与原版相同）
    │   └── progress.js            学习记录、进度统计、课程/插画/结论查询
    ├── components/
    │   ├── navigation.js          顶栏折叠菜单
    │   ├── app-shell.js           外壳同步（模式、字号、导航高亮）与视图调度
    │   ├── figure.js              「插图 + 图注」组件
    │   ├── home-view.js           首页与课程目录
    │   ├── lesson-view.js         分步讲解页（五讲按知识类型使用不同图文版式）
    │   ├── practice.js            互动练习页
    │   ├── quiz.js                课程小测验
    │   └── result-view.js         学习完成页
    ├── router.js                  hash 路由、地址参数（?mode= / ?big=）、刷新恢复
    ├── actions.js                 统一 data-action 事件分发、答题判定、键盘操作
    └── main.js                    入口：初始化顺序与事件监听注册
```

`assets/` 目录没有创建：原项目的 45 张插画全部由内嵌 SVG 代码绘制，没有位图或图标文件，单独建一个空目录没有意义。

---

## 三、模块约定

1. **单一命名空间**：每个文件都是一个立即执行函数，形如

   ```js
   (function (App) {
     'use strict';
     const { esc, state } = App;      // 取用前面模块注册的成员
     function something() { /* … */ }
     Object.assign(App, { something }); // 注册本模块对外提供的成员
   })(window.AIKEPU = window.AIKEPU || {});
   ```

   这样做保持了原文件"一个作用域 + 严格模式"的语义，同时把 113 个顶层声明按职责分到 22 个文件里。

2. **加载顺序即依赖顺序**：`index.html` 中的 `<script>` 顺序不能随意调整。`scripts/main.js` 必须最后加载，它在 DOM 就绪后调用一次 `init()`。用 `node dev/tools/split-modules.js`（在上一级目录）可以重新生成项目并自动校验"每个模块的依赖都在它之前注册"。

3. **两处按调用时取用**：视图之间互相调用无法用加载顺序解决，因此
   - `components/app-shell.js` 的 `render()` 通过 `App.renderXxx()` 调用各视图；
   - `components/lesson-view.js` 的 `renderLesson()` 通过 `App.renderPractice()` / `App.renderQuiz()` 进入互动与测验。

   这两处（共 7 个调用点）与其余代码一致地保持原有行为，只是把"直接调用"改为"运行时从命名空间取用"，避免模块之间形成循环依赖。

4. **状态是共享对象**：`state/app-state.js` 导出的 `state` 是同一个对象引用，各模块通过 `const { state } = App` 取用后修改其属性，行为与原版一致（原版也是全局共享同一个 `state`）。

5. **插画缩略图开关**：原版用同一个作用域里的 `compactArt` 变量控制"缩略图省略文字标注"。拆分后该变量由 `scripts/data/art.js` 自己持有，并导出 `setCompactArt()` 供 `scripts/services/progress.js` 的 `artThumb()` 调用，行为不变。

---

## 四、修改代码时的注意事项

- **加内容**：课程文案改 `scripts/data/courses-1.js` / `courses-2.js`；界面措辞改 `scripts/data/ui-text.js`；插图改 `scripts/data/art.js`（每个场景是一个返回 SVG 字符串的函数）。
- **加样式**：按原分区放入对应文件；**不要调整 `index.html` 中 `<link>` 的顺序**，否则会改变层叠结果。
- **加交互**：在 `scripts/actions.js` 的 `handleAction()` 里加一个 `case`，按钮写 `data-action="你的动作名"`；事件是统一委托在 `document` 上的，不要给元素单独绑监听。
- **存储**：键名 `yifenzhishi-ai-kepu-v1` 与数据结构保持不变，升级时不要清空或改写已有数据（原版写入的数据可直接被本版本读取）。
- **无障碍**：修改标记时保留 `aria-*`、`role`、`hidden` 与跳转链接，键盘操作（← → 翻步骤、Esc 收菜单）依赖这些属性。

---

## 五、兼容与限制

- 目标环境为现代 Chromium / Firefox / Safari；`file://` 下运行需要浏览器允许本地脚本，Chrome、Edge 默认允许。
- 样式与脚本必须保持在同一目录结构内（使用相对路径），移动文件时请整体移动。
- 未使用任何构建工具、包管理器或框架；不需要 `npm install`。
- 详细的功能一致性测试、未验证项目与原版差异请见 **`模块映射与测试记录.md`**。

---

## 六、部署到 GitHub Pages 与后续更新

> 当前状态：**已部署上线** —— 站点 <https://wuzerui45-debug.github.io/ai-science-learning/>，仓库 <https://github.com/wuzerui45-debug/ai-science-learning>。
> 下面的步骤既是"如何重新做一遍"，也是"换到别的账号时怎么做"。

### 1. 为什么可以直接部署

- 纯静态站点：只有 HTML、CSS、原生 JavaScript 与内嵌 SVG，没有后端、没有数据库、没有接口调用。
- 全部引用都是**相对路径**（`styles/…`、`scripts/…`），因此放在仓库子路径 `https://<用户名>.github.io/ai-science-learning/` 下也能正确加载。
- 未使用 ES Modules，也没有构建步骤，仓库里的文件就是最终上线的文件。
- 学习进度存在浏览器 `localStorage` 中，键名 `yifenzhishi-ai-kepu-v1`，线上与本地行为一致（线上是 https 源，数据按站点域名隔离）。

### 2. 仓库配置

| 项目 | 取值 |
| --- | --- |
| 仓库名 | `ai-science-learning` |
| 可见性 | Public（Public 仓库才能免费使用 Pages） |
| 默认分支 | `main` |
| 仓库根目录 | 本目录（`index.html` 就在根目录） |
| Pages 发布源 | `Deploy from a branch` → 分支 `main` → 目录 `/ (root)` |

### 3. 首次部署（三种方式任选）

**方式 A：网页上传（不需要安装任何工具）**

1. 打开 <https://github.com/new>，仓库名填 `ai-science-learning`，可见性选 **Public**，点 **Create repository**。
2. 在空仓库页面点 **uploading an existing file**。
3. 把本目录（`ai-science-learning`）里的**所有文件和文件夹**（`index.html`、`styles/`、`scripts/`、`README.md`、`模块映射与测试记录.md`、`.gitignore`、`.nojekyll`、`启动本地服务器.bat`）一起拖进上传区。
4. 提交信息填 `初始提交：模块化科普网页`，点 **Commit changes**。
5. 进入仓库 **Settings → Pages**：Source 选 `Deploy from a branch`，Branch 选 `main` + `/ (root)`，点 **Save**。
6. 等待 1—2 分钟，访问 `https://<你的用户名>.github.io/ai-science-learning/`。

**方式 B：使用仓库自带的发布脚本（不需要安装 git，只用 GitHub CLI）**

```powershell
# 只需一次性登录：安装 GitHub CLI 后执行 gh auth login，选 “Login with a web browser”
pwsh -File dev\tools\deploy-to-github.ps1 -Owner <你的用户名> -Repo ai-science-learning
```

脚本会把本目录整体发布为一次提交；分支已存在时会在最新提交之上追加，不会强推、不会丢历史。

**方式 C：Git 命令行**

```bash
cd ai-science-learning
git init -b main
git add .
git commit -m "初始提交：模块化科普网页"
git remote add origin https://github.com/<你的用户名>/ai-science-learning.git
git push -u origin main
```

推送后同样在 **Settings → Pages** 里选择 `main` + `/ (root)`。

### 4. 后续更新流程

1. 在本地修改 `styles/`、`scripts/` 中的文件（改哪一类见「四、修改代码时的注意事项」）。
2. 本地测试：双击 `index.html`，或用 `python -m http.server` 起本地服务器，按 `模块映射与测试记录.md` 里的清单过一遍。
3. 用下面任一方式发布（三选一，不要混用）：

   | 方式 | 操作 |
   | --- | --- |
   | 网页上传 | 仓库页面 → **Add file → Upload files** → 拖入改动过的文件 → **Commit changes** |
   | 发布脚本 | `pwsh -File dev\tools\deploy-to-github.ps1 -Owner <用户名> -Message "本次改了什么"` |
   | Git | `git add . && git commit -m "本次改了什么" && git push` |

4. 提交后 GitHub Pages 会自动重新部署（通常 30—90 秒），刷新线上地址即可看到更新。
5. 如果页面没变化，先按 **Ctrl + F5** 强制刷新排除浏览器缓存，再到仓库 **Actions** 页面确认部署任务是否成功。

> 本项目使用「从分支发布」（`Deploy from a branch`），**没有也不需要** GitHub Actions 工作流；请不要同时启用 Actions 发布方式，避免两套机制互相覆盖。

### 5. 部署后的自检清单

| 检查项 | 期望结果 |
| --- | --- |
| 首页能打开 | `https://wuzerui45-debug.github.io/ai-science-learning/` 返回 200，页面完整显示 |
| 样式与脚本加载 | 浏览器控制台无 404；7 个 CSS、22 个 JS 全部加载（Network 面板可见） |
| 两种模式切换 | 顶栏「儿童版 / 老年版」切换正常，正文语气与字号随之变化 |
| 大字阅读 | 老年模式下出现「大字阅读」开关，打开后字号 20px → 25px |
| 五讲课程与步骤 | 目录进入任一课，上一步/下一步、步骤方块、进度条正常 |
| 互动与测验 | 生活场景可展开结论，测验能判定对错并出成绩 |
| 学习进度保存 | 刷新页面后仍停留在原来的课程与步骤（数据存于该域名的 localStorage） |
| 手机端 | 窄屏下顶栏折叠为「菜单」，各视图无横向滚动 |
