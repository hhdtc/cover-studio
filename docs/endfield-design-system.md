# Endfield 官网逆向：设计系统与组件库

对 `https://endfield.gryphline.com/en-us` 做了一次**被动结构观察**，目标是拆出字体、组件、视觉效果与动效规律，再据此重建一套可复用的组件库。本页记录观察结果、推导出的令牌，以及哪些东西**没有**被复制。

- 观察时间：2026-10-31（站点 `official-v4` 构建）
- 手段：REA `inspect_web_page` / `capture_web_screenshot`（CDP 被动观察）+ 直接读取公开的 CSS/HTML 声明的数值 + 一次 `Runtime.evaluate` 计算样式普查
- 产物：`src/endfield-kit/`（10 个组件）、`src/views/EndfieldKitView.vue`（演示页，路由 `#/endfield-kit`）

> 站点内容（美术、商标、文案、字体文件）版权归 Gryphline / Hypergryph 所有。本项目只复用**结构与数值规律**，不附带任何原始素材。

---

## 1. 技术栈事实

| 项目 | 观察结果 |
| --- | --- |
| 框架 | Next.js（`_next/static` 分包、`data-precedence` 样式表、多段内联 hydration 脚本） |
| 样式 | Emotion（`<style data-emotion>`）内联 + 9 个独立 CSS 文件，合计约 382 KB |
| 静态资源 | `web-static.hg-cdn.com/endfield/official-v4/` |
| 脚本 | 26 个 chunk，无 sourcemap 声明 |
| 多语言 | 14 个 locale 路由（`/zh-tw`、`/ja-jp`、`/ko-kr`、`/es-mx`、`/pt-br`、`/fr-fr`、`/de-de`、`/ru-ru`、`/it-it`、`/id-id`、`/th-th`、`/vi-vn`） |
| 页面分区 | `#home` `#operator` `#lore` `#information` `#calendar` `#gameplay` `#aic` `#notice` |

## 2. 字体

站点**自托管 10 个 woff2**，`font-display: swap`，全部以 `font-weight: 400` 声明，靠不同字重文件区分粗细——即字重写在 `font-family` 里，而不是靠 weight 轴。

| 观察到的 family | 字重文件 | 在页面中的角色 |
| --- | --- | --- |
| Novecentosanswide | DemiBold / Medium / Bold | 宽体无衬线：标题、栏目名、HUD 标签 |
| Gilroy | Light / Medium / ExtraBold | 几何无衬线：正文、按钮、说明 |
| Roboto | Regular / Black | 数字与技术性小字 |
| SpaceGrotesk | Regular | 坐标、编号等标注（本身是 SIL OFL 开源字体） |
| ProtestStrike | Regular | 模板喷漆感装饰字 |

计算样式普查里实际生效的族：`SansMedium`(56)、`Novecentosanswide-Medium`(11)、`Novecentosanswide-DemiBold`(10)、`Gilroy-Light`(8)、`Gilroy-Medium`(7)、`Novecentosanswide-Bold`(3)。

**本库的处理**：Gilroy 与 Novecento Sans Wide 是商业字体，ProtestStrike 同样需授权，一律不随仓库分发，也不从对方 CDN 引用。`--efk-font-display` / `--efk-font-ui` 给的是可替换字体栈（Archivo / Inter Tight / system-ui），需要正式效果时请自行购买授权或换成 OFL 字体（如 Anybody、Archivo Expanded）。SpaceGrotesk 是 OFL，可合法自托管。

## 3. 调色板

统计 CSS 中 `color` 与 `background-color` 的出现频次（前几名）：

| 值 | 次数 | 用途 |
| --- | --- | --- |
| `#191919` | 67 / 14 | 主文字与主底色（墨黑，非纯黑） |
| `#ffffff` | 33 / 26 | 纸面、反白文字 |
| `#fffa00` | 34（底色） | **信号黄**，全站唯一饱和强调色 |
| `#999` `#b3b3b3` `#a6a6a6` | 15 / 7 / 5 | 次级与弱化文字 |
| `#2e2e2e` `#141414` | 5 / 4 | 抬升面与更深的底 |
| `rgba(0,0,0,.5)` | 11 | 半透明遮罩 |

推导出的令牌（`--efk-*`）保持同样的层级，另加两个功能性颜色：标注线 `#5ad2ff`、色差通道红 `#ff2e4d` / 绿 `#29ffa8`。

## 4. 字号阶梯

声明值高度集中在 rem 上，实测计算值形成一条 10 → 60px 的阶梯：

```
10 · 11.25 · 12.5 · 13.75 · 15.6 · 17.5 · 18.75 · 25 · 30 · 60
```

- 行高：`line-height: 1` 出现 63 次，是绝对主流；正文才用 1.25 / 1.5 / 1.6
- 字距：显示级紧收 `-.02em ~ -.06em`；技术标注反而放宽到 `.08em`、`1rem`
- 小字（10–11.25px）一律大写 + 加宽字距，作为「仪器读数」层

本库把它映射为 `--efk-t-10 … --efk-t-30` 加 `clamp()` 的显示级标题。

## 5. 几何：切角是主要语言

观察到的 `clip-path` 形状（按出现次数）：

| 形状 | 语义 |
| --- | --- |
| `polygon(0 0, 30% 0, 100% 50%, 30% 100%, 0 100%, 70% 50%)` | 双箭头／菱形导航 |
| `polygon(0 20%, 100% 50%, 0 80%)` | 右指楔形 |
| `polygon(0 0, 25% 0, 25% 100%, 0 100%)` | 左侧色条 |
| `inset(50%)` | 遮罩揭示（把元素「压扁」到不可见，用于动画起止） |
| `polygon(calc(50% - 182.5px) …)` | 随视口计算的居中切带 |

本库据此定义了：按钮切角（`--efk-btn-notch`，10/7/13px 三档）、页签右缘 55° 楔形、标题色带的斜端梯形、面板四角刻度。

## 6. 视觉效果

1. **色差（chromatic aberration）**：`filter: grayscale(1) brightness(.76) contrast(200) url(#red-green)` —— 引用页面内联 SVG 滤镜，把 R/G 通道错位，做出「信号不稳」的红绿边。
   本库改为纯 CSS 实现：两层通道副本 + `mix-blend-mode: screen` + `steps(2)` 抖动，默认只在 hover/live 时开启，避免整页常驻动画。
2. **扫描线／网点**：`repeating-linear-gradient` 细条纹（`.efk-scanlines`）与 45° 斜纹（`.efk-hatch`）。
3. **发光叠层**：`drop-shadow` 连续叠三次（`.25rem → .5rem → .5rem`）做白色辉光；文字用三层 `text-shadow` 加白。
4. **去色重映射**：`brightness(0) invert(1)` 把图标翻白，配合 `filter` 复用同一套 SVG。

## 7. 动效

| 名称 | 时长/曲线 | 结构 |
| --- | --- | --- |
| boot flashing | `1s ease-out forwards` | `0→.5→0→.5→0→.5→0→1`，四段衰减后稳定，用于入场 |
| rolling carousel | 线性循环 | `translateX(0)` → 80% 处到 `-50%` → 保持，即「滚一段、停一下、再回卷」 |
| scroll tip | `1.6s infinite` | 小箭头周期性下移 + 透明度呼吸 |
| activity shake | `2s ease-in-out infinite` | 活动角标轻微抖动 |
| loading fade | `.6s cubic-bezier(1,0,.7,1) .5s forwards` | 延迟入场 |
| 常规过渡 | `.2s ease` / `.3s` | 背景色、颜色、位移 |

本库保留同样的节奏，但默认遵守 `prefers-reduced-motion`，并提供 `.efk-no-motion` 全局开关（演示页右上角可切）。

## 8. 组件清单

| 组件 | 文件 | 对应观察 |
| --- | --- | --- |
| `EfButton` | `EfButton.vue` | 切角按钮、内描边、hover 斜向扫光 |
| `EfPanel` | `EfPanel.vue` | HUD 面板、四角刻度、标题栏编号块、可选扫描线 |
| `EfSectionHead` | `EfSectionHead.vue` | 序号 + 大标题 + 技术副标 + 渐隐分隔线 |
| `EfTabBar` | `EfTabBar.vue` | 55° 楔形页签，选中反色 |
| `EfStat` | `EfStat.vue` | 读数行：标签 / 数值 / 单位 / 刻度条 |
| `EfMarquee` | `EfMarquee.vue` | 滚动信息条，80% 停顿循环 |
| `EfGlitch` | `EfGlitch.vue` | 色差标题（screen 混合 + steps 抖动） |
| `EfScrollHint` | `EfScrollHint.vue` | 1.6s 呼吸下箭头 |
| `EfTag` | `EfTag.vue` | 小号大写标签，accent / live 变体 |
| `EfRail` | `EfRail.vue` | 左侧竖向导航，选中反色 + 左侧黄色刻度 |

## 9. 接入

```ts
import { EfButton, EfPanel, EfStat } from './endfield-kit'
import './endfield-kit/tokens.css'
import './endfield-kit/kit.css'
```

类名前缀统一为 `efk-`（`ef-` 已被站内既有的 Endfield 演示占用，避免样式互染），CSS 变量统一为 `--efk-*`。

## 10. 明确没有做的事

- 没有复制任何 CSS 规则文本、SVG 图形、图片、字体文件或文案；仓库中 `efk-*` 规则全部按观察到的**数值规律**重写。
- 没有调用站点私有接口，没有注入脚本，没有绕过任何访问控制；观察对象是公开页面与其公开静态资源。
- 演示页里的所有文字都是占位文案（如「协议同步完成」「轨道校准 03」），不代表原站内容。
- 本地抓取的第三方 CSS/字体存放在 `.analysis/endfield/`，已在 `.gitignore` 中排除，不随仓库分发。
