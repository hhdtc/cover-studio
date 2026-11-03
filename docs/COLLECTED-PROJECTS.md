# 收录项目注意事项 / Collected Projects Notice

本文档说明「UI 组件库」收录第三方项目时的许可、署名、素材边界、Demo 运行方式与维护规则。适用于当前已收录的 **Rhine Music · Windows** 与 **Endfield UI**，也作为后续新增项目的检查清单。

> 本文档不是法律意见。涉及再分发、商业使用或官方素材时，请以各项目原始许可证、NOTICE 与权利人要求为准。

---

## 1. 通用原则

### 1.1 代码许可与素材许可分开看

一个仓库的代码采用 MIT，不代表其中的图片、模型、字体、音频、商标也采用 MIT。

收录时必须分别确认：

- **代码**：许可证类型、版权声明、是否要求保留 NOTICE；
- **非代码素材**：封面、截图、模型、图标、字体、官方 Logo、游戏内纹理、音频；
- **名称与商标**：项目名、游戏名、角色名、厂牌名能否用于展示与描述。

不能确认授权的素材，不复制进本站仓库，只保留原文链接或远程加载。

### 1.2 保留署名与许可证

- 不删除、不改写原项目的 `LICENSE`、`NOTICE`、`THIRD-PARTY-NOTICES` 等文件。
- 页面与文档中保留作者、上游项目、维护者与许可证信息。
- 派生版本同时保留上游署名，不能只署最终维护者。

### 1.3 不宣称官方关系

所有收录项目均视为第三方爱好者项目。本站：

- 不表示与游戏开发商、发行商或项目作者存在隶属、赞助、认可或合作关系；
- 不使用官方 Logo 作为本站品牌；
- 不把项目描述成「官方组件库」「官方 Demo」。

### 1.4 只做索引与原创示意，不复制实现

- 模块说明依据公开 README、设计文档与文件职责整理，不整段复制源代码。
- 组件视觉 Demo 使用原创 HTML/CSS 重绘，用于展示结构与动效，不冒充原组件。
- 需要真实行为时，链接或内嵌原项目 Demo，并明确标注来源。

### 1.5 Demo 的边界

- 优先使用项目公开的在线 Demo；没有在线 Demo 时，才在本地克隆并运行。
- 本地运行只绑定 `127.0.0.1`，不暴露到公网。
- 内嵌第三方页面时，页面内容不受本站控制；不缓存、不再分发其中的官方素材。
- 第三方 Demo 无法访问时，提供「新窗口打开」与原仓库链接作为回退。

### 1.6 记录版本与改动

- 记录收录时的版本号或 commit；项目更新后重新核对模块、路由与许可。
- 对原项目的任何本地修改都要单独记录，并确保修改仍符合原许可证。
- 同步更新 `/ui-catalog.json` 与页面内的 AI CONTEXT，避免索引过期。

### 1.7 下架机制

权利人提出异议，或发现许可不兼容时：

1. 立即移除相关 Demo、截图与模块说明；
2. 保留项目链接或改为纯文字引用；
3. 在 CHANGELOG / 文档中记录移除原因与日期；
4. 不继续分发相关素材。

---

## 2. Rhine Music · Demo

### 2.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/RonaldDeng/Rhine-Music-Demo |
| 维护者 | RonaldDeng |
| 界面基础 | LBEILC / RhineLabUI |
| 代码许可 | MIT |
| 版权声明 | Copyright (c) 2026 LBEILC；Copyright (c) 2026 RonaldDeng |
| 收录版本 | v0.6.1 |
| 在线 Demo | 无（仓库未提供 Pages 站点）；本站用本地 5175 端口 |

### 2.2 收录方式

- 源码 clone 到 `demos/rhine-music-demo`（整个 `demos/` 已在 `.gitignore` 中，不进仓库、不进主站构建）。
- 依赖用 `npm ci` 安装；lockfile 里的 `registry.npmmirror.com` 已改写成 `registry.npmjs.org`（沙箱禁止拉 remote 包）。
- `npm run build` 产出 `dist/`，由上游自带的 `scripts/music-server.mjs` 在本机 5175 提供服务。
- 10 个模块的「相关文件」路径全部对 `main` 分支的文件树逐个核对过（336 个文件）。
- 界面截图通过 `raw.githubusercontent.com` 远程加载，不复制进仓库；离线时可能无法显示。
- 站内默认 Demo 指向**真实构建**：`http://127.0.0.1:5175/?demo=1`，用内置演示封面。
- 没有本地服务时用 `/rhine-gallery.html`（上游截图页）；`/rhine-mock.html` 是早期的纯 CSS 近似版，仅作静态回退。

### 2.3 设计要点

| 维度 | 观察 |
| --- | --- |
| 布局 | 三列「真实列」，列内独立滚动，列位置是状态而非纯 CSS |
| 三维 | 唱片盒与 CD 分开建模，主题切换同时改光照色温 |
| 播放 | 双缓冲预载实现无缝切歌，不支持时退化为普通切换 |
| 歌词 | 时间轴与渲染分离，沉浸模式逐行位移而非逐字 |
| 交互 | 滚轮与触控板两套系数，吸附阈值按列宽比例 |
| 动效 | 详情转场分封面/背景/文案三层，减少动效时直停终态 |

### 2.4 素材边界

以下内容**不因代码采用 MIT 而自动获得授权**，本站不复制、不转存：

- `art/*.blend`、`public/assets/*.glb` 等模型与建模产物；
- 界面图标、截图、动图，以及演示文本中涉及的《明日方舟》相关视觉元素；
- MiSans 字体（按 MiSans 字体协议随应用嵌入，不是 MIT）；
- 继承自上游的程序编配音频；
- 原 PV、官方图片、商标、角色与设定。

### 2.5 禁止事项

- 不使用本项目名义再分发模型、字体、官方截图或音频；
- 不把演示封面说成真实商业专辑；
- 不宣称与鹰角网络、RhineLab 或原作者存在官方合作；
- 不将包含官方素材的构建产物提交到本站仓库或发布页。

---

## 3. Endfield UI

### 3.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/icaruszezen/endfield-ui |
| 作者 | icaruszezen |
| 代码许可 | MIT |
| 技术栈 | React、TypeScript、Tailwind CSS v4、Base UI、Storybook |
| npm 包 | `@endfield-ui/react` |
| 在线预览 | https://icaruszezen.github.io/endfield-ui/ |
| 设计文档 | https://icaruszezen.github.io/endfield-ui/design/ |
| 收录方式 | 在线 iframe + 远程截图，不本地克隆 |

### 3.2 素材边界

- 组件库主入口与主样式**不包含官方素材**。
- 「Game 实机风格」是独立入口，包含约 30 张官方图片（界面纹理、卡片背景、开屏底图、两张官方标志），**不在 MIT 范围内**。
- 该入口可通过 `data-ef-game-images="off"` 关闭图片；未获授权时不要使用、截图再分发或打包这些素材。
- 在线 Storybook 包含 Game 入口；浏览时可能由第三方页面加载官方图片，本站不缓存、不再分发。
- 页面截图通过 `raw.githubusercontent.com` 远程加载，不复制进仓库。

### 3.3 Demo 与引用

- 使用 GitHub Pages 上的公开 Storybook，通过 iframe 内嵌；不复制其构建产物。
- 组件安装方式：`pnpm add @endfield-ui/react`。
- 页面中的组件视觉 Demo 为本站原创 CSS 重绘，仅示意布局、状态与动效，不是官方组件实现。
- 项目为非官方爱好者项目，与鹰角网络无关；描述中不得暗示官方认可。

### 3.4 禁止事项

- 不把 Game 实机风格入口的官方图片打包进本站或再发布；
- 不使用《明日方舟：终末地》官方标志作为本站或组件库品牌；
- 不把 CSS 重绘的视觉 Demo 说成项目原始组件；
- 不在未保留 MIT 与作者署名的情况下再分发组件代码。

---

## 4. NASA-Punk UI Skill

### 4.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/duanth/NASA-Punk-UI-SKILL |
| 作者 | duanth |
| 代码许可 | MIT（Copyright (c) 2026 duanth） |
| 形态 | 面向 AI 编码智能体的设计系统技能包（`SKILL.md` + 单文件参考实现） |
| 参考实现 | `assets/reference.html`，零依赖单文件 |
| 本地托管 | `public/nasa-punk-reference.html` |
| 收录版本 | main 分支（2026-10） |

### 4.2 代码、托管与本地改动

- 仓库克隆在 `demos/nasa-punk-ui`，保留 `LICENSE`、`README.md`、`README.en.md`、`SKILL.md` 与 docs 预览图。
- 将 `assets/reference.html` 复制到 `public/nasa-punk-reference.html` 以便在主站内嵌展示；MIT 允许复制，但必须保留版权与许可声明。
- 复制时仅在文件顶部加入一行 HTML 注释，标注作者、MIT 许可与仓库地址；未修改页面内容、样式或脚本。
- 参考实现中的图片全部是内联 SVG / data URI 或页面内元素，不依赖外部图片服务。
- 页面截图通过 `raw.githubusercontent.com` 远程加载，不复制进仓库。

### 4.3 素材与品牌边界

- 代码为 MIT；但 NASA 徽记与标志是**美国政府商标**（14 CFR Part 1221），不在 MIT 授权范围内。
- 仓库声明只包含虚构的、受启发的品牌与徽章；本站也不使用 NASA 官方徽记、标志或照片。
- 参考实现中的米白纸面、信号红、海军蓝、蓝图网格、条码、纹章等均为项目原创的视觉语言，使用时需保留署名。
- docs 中的预览图含项目生成的版式与插图；不把它们说成 NASA 官方材料。

### 4.4 Demo 与引用

- 地址：http://127.0.0.1:5173/nasa-punk-reference.html
- 单文件、零依赖，直接由主站静态托管；不需要本地服务或构建步骤。
- 页面可交互，包含印刷文档、控制台、图表、纹章与动效示例。
- 组件库中的六个视觉 Demo 为本站原创 CSS 重绘，仅示意版式与动效，不是官方组件实现。

### 4.5 禁止事项

- 不使用 NASA 官方徽记、标志或官方照片作为本站或演示品牌；
- 不宣称与 NASA、项目作者存在官方合作或认可关系；
- 不把 CSS 重绘的 Demo 说成项目原始组件；
- 不在未保留 MIT 版权与作者署名的情况下再分发 `reference.html`。

## 5. NERV UI

### 5.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/TheGreatGildo/nerv-ui |
| 作者 | TheGreatGildo |
| 代码许可 | MIT（Copyright (c) 2026 TheGreatGildo） |
| 形态 | 零依赖样式表 + 自包含 HTML 组件 + AI 智能体技能包（`SKILL.md`） |
| 体量 | `nerv-ui.css` 808 行；6 个组件页；`demo.html` 约 64 KB |
| 站点 | 上游无独立站点，参考实现已原样托管在本站 `/nerv-ui/` |

### 5.2 收录内容

| 文件 | 说明 |
| --- | --- |
| `public/nerv-ui/demo.html` | 完整控制台：拓扑图、指标、事件流、金库卡、MAGI 共识、紧急模式 |
| `public/nerv-ui/nerv-ui.css` | 全部设计令牌、CRT 效果与组件类 |
| `public/nerv-ui/components/*.html` | `event-log` / `vault-card` / `magi-oracle` / `metrics-grid` / `data-table` |
| `public/nerv-ui/components/crt-effects.css` | 可单独取用的 CRT 叠层 |
| `public/nerv-ui/LICENSE` | MIT 原文，随文件一起分发 |
| `public/nerv-ui/README.md` | 来源、许可与「未随附任何ip作品素材」的说明 |

### 5.3 设计语言要点

- **默认纯黑**：没有数据时屏幕保持关闭，不用骨架屏占位。
- **一色一职**：橙 `#FF9830` 结构、绿 `#50FF50` 数据、青 `#20F0FF` 连线、红 `#FF3030` 仅告警。
- **仪器化排版**：明朝体标题 + 等宽正文 + 压缩体印章，数字一律 tabular 对齐。
- **CRT 效果零图片**：扫描线、暗角、闪烁、辉光全是 CSS 渐变与多层阴影。
- **状态双重编码**：颜色之外总有文字（「一致 / 分歧」「OPERATIONAL」）。

### 5.4 素材与许可边界

- 上游代码为 MIT，本站**原样托管并保留 `LICENSE` 与版权声明**，未做改写。
- 页面为纯 CSS/DOM，**不含任何动画作品的美术素材、标志或角色图像**；风格是对「虚构军用控制台」这一母题的个人演绎。
- 字体来自 Google Fonts（Noto Serif Display、JetBrains Mono、Saira Extra Condensed、Shippori Mincho B1），各自遵循原许可；离线环境下会回退到系统衬线/等宽字体。

### 5.5 对应模块

`nrv-foundations` 色彩与字体 · `nrv-crt` CRT 效果 · `nrv-console` 布局与指标 · `nrv-data` 事件流与表格 · `nrv-magi` MAGI 与金库卡 · `nrv-emergency` 紧急模式

---

## 6. AUREOLE · Sixth UI

### 5.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/AlphaZero78/ArknightsSixthUI |
| 作者 | AlphaZero78 / ArknightsSixthUI contributors |
| 代码许可 | MIT（Copyright (c) 2026 ArknightsSixthUI contributors） |
| 形态 | React 19 + Vite 的交互模板，CSS 三维图像平面 |
| 本地目录 | `demos/arknights-sixth-ui` |
| 本地 Demo | http://127.0.0.1:5176/ |

### 5.2 来源与素材

- 视觉来源：《明日方舟》六周年庆典活动宣传 PV 中文 P1 的 00:11–00:53；逐段锚点见 `docs/SOURCE-STUDY.md`。
- 演示主体图片（`public/images/`）为项目独立生成的素材，不是官方截图或官方模型。
- 字体：Times New Roman、Noto Serif SC、少量 Bodoni Moda；中文字体自行托管，OFL 许可证在 `public/fonts/`。
- 项目为非官方爱好者模板，与鹰角网络无关；名称与记录为虚构示例。
- 页面截图通过 `raw.githubusercontent.com` 远程加载，不复制进仓库。

### 5.3 运行与构建

```sh
cd demos/arknights-sixth-ui
npm install
npm run build
npm run preview -- --port 5176
```

- 主站 `package.json` 提供 `npm run demo:aureole`。
- 构建输出在 `dist/client/`；预览服务只绑定本机。
- 收录时未修改其源代码；依赖安装使用本地缓存与 npmjs registry。

### 5.4 禁止事项

- 不使用官方 PV 截图、官方模型或官方 Logo 作为本站素材；
- 不宣称与鹰角网络存在官方合作或授权；
- 不把演示主体图片说成官方素材；
- 不在未保留 MIT 与字体 OFL 许可的情况下再分发模板或其构建产物。

## 7. p5-ui · Persona 5 UI

### 6.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/q-mona/p5-ui |
| 作者 | AYi / q-mona |
| 许可证 | **未提供 LICENSE，默认保留所有权利** |
| 形态 | Vue 3 组件库，npm 包名 `p5-ui` |
| 本地目录 | `demos/p5-ui`（仅本地评估，已 gitignore） |
| 本地文档站 | http://127.0.0.1:5177/ |

### 6.2 许可状态与处理方式

- 仓库没有 LICENSE 文件，GitHub API 也未识别到许可证；按默认版权规则，未经许可不得复制、修改或再分发代码与素材。
- 因此本站**不复制**其源代码、Sass、字体、图片、SVG、构建产物或文档截图。
- 只保留仓库链接、npm 包名与模块说明；模块说明为依据公开 README 与文件结构整理的原创摘要。
- 为评估交互，仓库被克隆到本地 `demos/p5-ui`，并用 Python 静态服务器运行其预构建文档站；该目录已加入 `.gitignore`，不提交、不随主站发布。
- UI 组件库中的六个视觉 Demo 与封面图 `public/p5-poster.svg` 均为本站原创的 CSS/SVG 重绘，不使用项目素材。

### 6.3 来源与素材

- 项目是 Persona 5 风格的爱好者作品，与 Atlus / SEGA 无关；本站不主张任何官方关系。
- 项目内含的字体、角色剪影、图标与图片权利归各自权利人；本站不复制、不缓存、不再分发。
- 页面只展示原创封面示意，并明确标注「未使用项目素材」。

### 6.4 Demo 运行

```sh
cd demos/p5-ui
python3 -m http.server 5177 --bind 127.0.0.1 \
  --directory examples/document-web/build
```

- 主站提供 `npm run demo:p5`。
- 仅绑定 `127.0.0.1`，用于本机评估；不对外提供镜像或下载。
- 预构建文档站依赖仓库自带资源，若仓库更新需重新拉取。

### 6.5 禁止事项

- 不在未取得授权的情况下复制、修改、再分发 p5-ui 的代码或素材；
- 不把本站的原创重绘说成 p5-ui 官方组件；
- 不使用 Persona 5 官方 Logo、角色图或字体作为本站品牌；
- 不将本地克隆、构建产物或文档站上传到公开仓库、静态托管或发布页。

### 6.6 下架条件

权利人提出异议，或仓库后续补充了限制性许可时，立即移除本地 Demo 入口、模块说明中的代码链接与封面，仅保留项目名称与仓库链接（或全部移除）。

## 8. Persona3-like-web

### 7.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/Masonli1203/Persona3-like-web |
| 作者 | Masonli1203 |
| 代码许可 | MIT |
| 技术栈 | Next.js 16、React 19、TypeScript、Tailwind CSS v4、Framer Motion、Three.js |
| 本地目录 | `demos/persona3-like-web` |
| 本地 Demo | http://127.0.0.1:5179/ |

### 7.2 素材与品牌边界

- 仓库只包含原创的通用 SVG 占位图、虚构文案与示例项目，不包含 Persona 官方游戏画面、音乐、Logo 或字体。
- 字体随包附带 OFL 许可（Anton、IBM Plex Mono 等），许可见 `src/assets/fonts/`。
- 项目是非官方、独立的灵感作品，与 ATLUS / SEGA 无关。
- 页面截图通过 `raw.githubusercontent.com` 远程加载，不复制进仓库。
- 模板的隐私检查脚本会阻止真实联系方式、私人照片或播放 ID 进入示例。

### 7.3 运行与构建

```sh
cd demos/persona3-like-web
npm install
npm run build
npm run start -- -p 5179
```

- 主站提供 `npm run demo:persona3`。
- 真实 Next.js 服务器只绑定本机；Docker 主站不包含它，需要单独运行。
- 收录时未修改其源代码；依赖安装使用本地缓存与 npmjs registry。

### 7.4 禁止事项

- 不使用 Persona 官方游戏素材、音乐或 Logo 作为本站内容；
- 不宣称与 ATLUS / SEGA 存在官方合作或授权；
- 不把示例项目、人物与文案说成真实商业案例；
- 不在未保留 MIT 与字体 OFL 许可的情况下再分发模板。

## 9. shadcn/ui

### 8.1 基本信息

| 项目 | 内容 |
| --- | --- |
| 仓库 | https://github.com/shadcn-ui/ui |
| 维护者 | shadcn |
| 代码许可 | MIT |
| 技术栈 | React、TypeScript、Tailwind CSS、Radix UI、Base UI、React Aria |
| 官网 / 文档 | https://ui.shadcn.com/ |
| 收录方式 | 在线文档 + 链接索引，不本地克隆 |

### 8.2 收录边界

- shadcn/ui 的组件不是传统 npm 依赖，而是通过 registry 把源码复制进使用者项目；本站只做在线文档链接、组件分类和原创视觉示意，不复制其源码或构建产物。
- 组件、示例、区块、主题与文档均采用 MIT；引用或再分发时保留 LICENSE。
- 官网与文档中的品牌、截图与字体权利归各自权利人；本站不把 shadcn/ui 描述成自己的组件库。
- 模块说明依据公开文档与 registry 结构整理，具体 API 以官方文档为准。

### 8.3 Demo

- 在线地址：https://ui.shadcn.com/
- 通过 iframe 内嵌官方文档；如果站点限制嵌入或加载失败，使用「新窗口打开」。
- 不在本地运行或镜像其构建；不需要 token 或环境变量。

### 8.4 禁止事项

- 不把 shadcn/ui 的组件源码直接打包进本站仓库；
- 不删除或改写其 MIT 版权声明；
- 不宣称与 shadcn 或项目维护者存在官方合作；
- 不把本站的原创视觉示意说成 shadcn/ui 官方组件。

## 10. 新增项目检查清单

收录前逐项确认：

- [ ] 仓库公开可访问，默认分支与版本已记录
- [ ] 代码许可证明确（MIT / Apache-2.0 / 其他），版权声明已保留
- [ ] NOTICE / THIRD-PARTY-NOTICES 已阅读
- [ ] 非代码素材的授权单独确认；不能确认的不入库
- [ ] 官方 Logo、游戏截图、字体、音频没有直接复制
- [ ] 作者、上游、维护者与许可证已写入页面和 README
- [ ] 项目被标注为第三方 / 非官方（如适用）
- [ ] 有在线 Demo 时优先使用在线 Demo，并检查是否允许 iframe
- [ ] 本地运行只绑定 127.0.0.1，不要求用户上传文件
- [ ] 本地修改已记录在文档，且符合原许可证
- [ ] 模块说明为原创摘要，没有大段复制源码
- [ ] 视觉 Demo 为原创重绘，并标注「示意」
- [ ] 路由、`/ui-catalog.json`、AI CONTEXT 已同步
- [ ] 中英文文案已补齐，默认语言跟随系统
- [ ] 新增模块 Demo 有可重播的动效，并支持 reduced motion
- [ ] README、收录文档与页面链接一致

---

## 11. 维护记录

| 日期 | 事项 |
| --- | --- |
| 2026-10-20 | 首次收录 Rhine Music · Windows；本地增加 `?demo=1` 纯视觉入口 |
| 2026-10-20 | 收录 Endfield UI；使用在线 Storybook 与远程截图 |
| 2026-10-20 | 增加中英双语、组件 AI CONTEXT、`/ui-catalog.json` 与动效重播 |
| 2026-10-20 | 收录 NASA-Punk UI Skill；托管单文件参考实现并加入六个视觉 Demo |
| 2026-10-20 | 收录 AUREOLE · Sixth UI；本地构建并在 5176 运行，加入六个视觉 Demo |
| 2026-10-21 | 收录 p5-ui；无 LICENSE，仅链接索引与本地评估，不复制代码/素材 |
| 2026-10-21 | 收录 Persona3-like-web；本地 Next.js 构建，加入六个视觉 Demo |
| 2026-10-21 | 收录 shadcn/ui；在线文档与链接索引，不复制组件源码 |

---

## 12. 相关文件

- 页面与数据：`src/views/UILibraryView.vue`
- 英文文案：`src/views/uiLibraryEn.ts`
- 组件视觉 Demo：`src/components/ModuleDemo.vue`
- 机器可读目录：`public/ui-catalog.json`
- 本地 Demo：`demos/rhine-music-windows/`、`demos/nasa-punk-ui/`、`demos/arknights-sixth-ui/`、`demos/p5-ui/`（仅评估）、`demos/persona3-like-web/`
- NASA 参考实现：`public/nasa-punk-reference.html`
- 主 README：`README.md`
