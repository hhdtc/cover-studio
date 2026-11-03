# UI 组件库 · UI Library

一个只做一件事的站点：收录 UI 项目，拆成模块，配可交互演示。

每个项目页有出处（作者、仓库、许可）、分组总览、逐模块的职责与关键文件、以及一份给 agent 读的 AI CONTEXT。纯前端，无账号、无上传。

## 收录范围

| 类别 | 项目 |
| --- | --- |
| 第三方仓库 | Rhine Music · Demo、Endfield UI、NERV UI、NASA-Punk UI Skill、AUREOLE、Persona3-like-web、shadcn/ui |
| 仅有链接 | p5-ui（仓库无 LICENSE，不托管） |
| 基于网页分析 | Endfield Kit（10 个组件）、Apple 排版与动效（12 个组件） |

导航只有一项：**UI 组件库**。两套基于网页分析的组件库有独立展示页（`#/endfield-kit`、`#/apple-kit`），从对应项目进入，不占导航位。

## 功能

- **搜索**：一个输入框同时过滤项目和跨项目模块，结果带所属项目名，可直接跳到模块
- **出处**：每个项目标注「第三方仓库 / 基于网页分析」、作者主页与仓库链接
- **模块页**：项目级 Demo 收成 132px 窄条，把版面留给模块本身
- **双语**：中英切换，默认跟随系统语言
- **机器可读**：[/ui-catalog.json](/ui-catalog.json) 含全部项目、模块与路由
- **AI CONTEXT**：每个模块可一键复制上下文

## 快速开始

要求 Node.js **26.12.1**（仓库提供 `.nvmrc`）。

```bash
nvm use
npm install
npm run dev      # http://127.0.0.1:5173/
```

## Docker

```bash
docker compose up -d --build     # 构建并启动，约 2 分钟（含两个子应用）
docker compose down              # 停止并移除容器
```

打开 http://localhost:8080/ 。默认路径**不需要任何 token**。

三个服务，只有 `web` 发布端口：

| 服务 | 对外 | 说明 |
| --- | --- | --- |
| `web` | `${PORT:-8080}` → 80 | 站点本体（nginx + 静态构建） |
| `rhine` | 仅 compose 内网 | Rhine Music 真实构建，镜像内 clone + 构建 |
| `persona3` | 仅 compose 内网 | Persona3-like-web（Next.js），镜像内 clone + 构建 |

两个子应用通过主机名反代，共用 8080：

- Rhine：`http://rhine.localhost:8080/?demo=1`
- Persona3：`http://p3.localhost:8080/`

用主机名而不是路径前缀，是因为这两个应用都假设自己占满一个 host 的根路径；加 `/rhine/` 前缀会破坏它们的绝对资源路径。`*.localhost` 由系统解析到 127.0.0.1，不需要改 hosts。

- 端口：`PORT=9000 docker compose up -d`
- 停止后重启：`docker compose up -d`（镜像已缓存，秒起）
- 删镜像：`docker compose down --rmi local`
- 想构建「GitHub 上已推送的提交」而非本地工作区：

```bash
cp .env.example .env      # 填 GITHUB_TOKEN（Contents: read）
docker compose -f docker-compose.remote.yml up -d
```

## 页面路由

| 页面 | 路由 |
| --- | --- |
| 组件库（首页） | `#/ui` |
| 项目总览 | `#/ui/<project>` |
| 模块 | `#/ui/<project>/<module>` |
| Endfield Kit 展示页 | `#/endfield-kit` |
| Apple Kit 展示页 | `#/apple-kit` |

深链示例：`#/ui/rhine-music/rhine-columns`、`#/ui/nerv-ui/nrv-magi`、`#/ui/apple-kit/ap-glass`、`#/ui/persona3/p3-home`。

## 项目与演示

| 项目 | 演示 | 许可 |
| --- | --- | --- |
| **Rhine Music · Demo** | `rhine.localhost:8080/?demo=1`（compose 服务）；备用截图 `/rhine-gallery.html` | MIT |
| **Endfield UI** | [在线 Storybook](https://icaruszezen.github.io/endfield-ui/) | MIT |
| **NERV UI** | 上游文件原样托管在 `/nerv-ui/` | MIT |
| **NASA-Punk UI Skill** | `/nasa-punk-reference.html` | MIT；NASA 徽记除外 |
| **AUREOLE · Sixth UI** | `npm run demo:aureole` → `5176` | MIT |
| **p5-ui** | `npm run demo:p5` → `5177`，仅本地评估 | **无 LICENSE** |
| **Persona3-like-web** | `p3.localhost:8080`（compose 服务） | MIT（仅原创占位素材） |
| **shadcn/ui** | [在线文档](https://ui.shadcn.com/) | MIT |

演示分三类，页面上会标明是哪一类：

1. **真实构建**（Rhine、Persona3）：上游原样跑在容器里
2. **上游截图 / 原样托管**（Rhine 备用、NERV UI）：静态，不执行上游逻辑
3. **组件示意**（各模块的演示）：本站按版式与交互重写的原创实现

第三方项目的许可、素材边界与新增项目检查清单见 **[docs/COLLECTED-PROJECTS.md](docs/COLLECTED-PROJECTS.md)**。

## 技能

收录一个站点、逆向出原创组件库并归档进本库的完整流程，写成了一份 skill：

```bash
cp -r skills/catalog-ui-site ~/.claude/skills/    # 或 ~/.codex/skills/
```

见 **[skills/catalog-ui-site/SKILL.md](skills/catalog-ui-site/SKILL.md)** —— 七个阶段（取范围 → 抓取 → CSS 普查 → 运行时普查 → 推导令牌 → 建组件 → 归档验证）、验收清单，以及一张「已经踩过的坑」对照表。

## 说明

- 技术栈：Vue 3 + TypeScript + Vite 6，无 UI 框架、无后端
- 收录项目只做索引、说明与原创视觉示意；不复制第三方代码或素材（上游以 MIT 原样托管或容器运行的情况除外，均保留 LICENSE）
- p5-ui 无许可证，仅链接与本地评估，不构建镜像、不对外托管
- 本项目为个人作品，不宣称与任何游戏、机构或原作者存在官方关系

## License

[MIT](LICENSE) © 2026 hhdtc

以上许可只覆盖本仓库自己的代码（站点、组件与文档）。收录的第三方项目各自保留原许可，见各项目页与 [docs/COLLECTED-PROJECTS.md](docs/COLLECTED-PROJECTS.md)；p5-ui 无许可证，不随本仓库分发。
