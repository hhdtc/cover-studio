# 封面工坊 · Cover Studio

纯前端的多工具视觉工作台：封面、一图流、通行证、幻灯片、动态立绘、素材生成，以及收录第三方项目的 UI 组件库。

所有处理都在浏览器里完成，图片不上传服务器。

![工具一览](docs/overview.png)

## 工具

| 工具 | 说明 |
| --- | --- |
| **UI 组件库** | 7 个项目的 demo、模块拆分、双语说明与 AI 上下文 |
| **素材生成** | 19 种程序化图样，PNG / SVG，9 套调色板 |
| **封面** | 模板、文字排版、背景、图层、拖拽，导出 2× PNG |
| **一图流** | 六类区块、自动高度、3 套主题，导出长图 |
| **通行证** | 头像、编号、条形码、签名，3 套配色 |
| **幻灯片** | 4 种版式、多页管理、全屏放映、批量导出 |
| **动态立绘** | 呼吸、视差、粒子、光晕，导出 PNG / WebM |

顶部导航为 **UI 组件库 / 素材生成 / 其他**；其余工具收在「其他」菜单。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5173/ 。

生产构建：

```bash
npm run build
npm run preview
```

## Docker

```bash
cp .env.example .env
chmod 600 .env          # 填入有 Contents: read 权限的 GITHUB_TOKEN
docker compose up -d
```

打开 http://localhost:8080/ 。

- 私有仓库必须提供 token；token 只注入 builder 容器，不会写进镜像
- 更新：`docker compose up -d --force-recreate`
- 停止：`docker compose down`；同时删除构建卷加 `-v`
- 端口：`PORT=9000 docker compose up -d`

## 页面路由

| 工具 | 路由 |
| --- | --- |
| UI 组件库 | `#/ui` |
| 素材生成 | `#/assets` |
| 封面 | `#/cover` |
| 一图流 | `#/flow` |
| 通行证 | `#/pass` |
| 幻灯片 | `#/slides` |
| 动态立绘 | `#/portrait` |

UI 组件库支持项目/模块深链，例如：

- `#/ui/rhine-music/shelf`
- `#/ui/endfield-ui/ef-controls`
- `#/ui/nasa-punk/nasa-console`
- `#/ui/aureole/aureole-blueprint`
- `#/ui/p5-ui/p5-controls`
- `#/ui/persona3/p3-home`
- `#/ui/shadcn-ui/shadcn-forms`

## UI 组件库

| 项目 | 演示 | 许可 |
| --- | --- | --- |
| **Rhine Music · Windows** | 默认自研 CSS 3D `/rhine-mock.html`；可切换真实前端 `5178` | MIT |
| **Endfield UI** | [在线 Storybook](https://icaruszezen.github.io/endfield-ui/) | MIT |
| **NASA-Punk UI Skill** | `/nasa-punk-reference.html` | MIT；NASA 徽记除外 |
| **AUREOLE · Sixth UI** | `npm run demo:aureole` → `5176` | MIT |
| **p5-ui** | `npm run demo:p5` → `5177`，仅本地评估 | **无 LICENSE** |
| **Persona3-like-web** | `npm run demo:persona3` → `5179` | MIT |
| **shadcn/ui** | [在线文档](https://ui.shadcn.com/) | MIT |

- Rhine 默认使用自研实现，5 张本地 mock 封面，不依赖 WebGL；需要原版时用 `npm run demo:rhine:fresh` 打开 `5178`
- 每个模块都有可交互视觉 Demo 和「打开真实 Demo」入口
- 中英双语，默认跟随系统语言，右上角可切换
- 每个模块有 **AI CONTEXT**，可一键复制；机器可读目录：[/ui-catalog.json](/ui-catalog.json)

第三方项目的许可、素材边界和新增项目检查清单见 **[docs/COLLECTED-PROJECTS.md](docs/COLLECTED-PROJECTS.md)**。

## 快捷键

| 按键 | 功能 |
| --- | --- |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `←/→` | 微调选中元素（Shift 加速） |
| `Delete` | 删除选中元素 |
| `Esc` | 取消选择 / 关闭浮层 |

## 说明

- 技术栈：Vue 3 + TypeScript + Vite，Canvas 2D 渲染，无 UI 框架、无外部图片素材
- 收录项目只做索引、说明与原创视觉示意；不复制第三方代码或素材
- p5-ui 无许可证，仅链接与本地评估，不随站点分发
- 本项目为私人使用，不宣称与任何游戏、机构或原作者存在官方关系
