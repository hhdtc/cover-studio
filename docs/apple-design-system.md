# Apple 官网逆向：排版与动效

对三个公开页面做了一次**被动读取**，只取两样东西：字号怎么排、动效怎么走。

- 观察时间：2026-10-31
- 页面：`/`、`/ipad-pro/`、`/iphone-duo/`（三页均 200）
- 手段：REA `inspect_web_page` / `capture_web_screenshot`（CDP 被动观察）+ 读取页面声明的 16 个样式表（约 1.63 MB）+ 一次 1600×913 下的计算样式普查
- 产物：`src/apple-kit/`（8 个组件）、`src/views/AppleKitView.vue`（`#/apple-kit`）

> 站点内容（SF Pro 字体、产品图片、商标、文案）版权归 Apple Inc. 所有。这里只保留**数值规律**，不附带任何原始素材。

---

## 1. 页面结构事实

| 观察项 | 结果 |
| --- | --- |
| 全局导航高度 | 44px，半透明 + 模糊 |
| 排版基调 | 居中大字标题 + 极宽留白 + 单列叙事 |
| 文档高度 | 首页 6060px、iPad Pro 45474px、iPhone Duo 33207px |
| sticky 元素 | 首页 0、iPad Pro 20、iPhone Duo 12 |
| backdrop-filter 层 | 首页 2、iPad Pro 21、iPhone Duo 27 |
| will-change | 首页 2、iPad Pro 80、iPhone Duo 172 |
| clip-path | 31 / 40 / 84 |
| mask-image | 3 / 1 / 4 |

产品页是**长文档**：靠 sticky 分组把内容切成章节，首页则是短促的轮播式总览。

## 2. 字体

| 项 | 观察值 |
| --- | --- |
| 正文 | SF Pro Text |
| 显示级 | SF Pro Display |
| 图标 | SF Pro Icons |
| 本地化 | SF Pro JP / KR / TH 等按语言分流 |
| 回退 | Helvetica Neue → Helvetica → Arial → sans-serif |

字体文件经 `/wss/fonts` 端点分发，**不下载、不随仓库分发**。字体栈以 `-apple-system` / `BlinkMacSystemFont` 开头，在 macOS 上自然命中系统字体。

## 3. 字号梯级

计算样式里反复出现的字号（px）：

```
12 · 14 · 17 · 19 · 21 · 24 · 28 · 32 · 40 · 48 · 56 · 64
```

声明值频次最高的是 17px（63 次），其次 14px（55）、12px（48）。

关键不是数字本身，而是**三元组绑定**——每级字号都配着固定的字距与行高：

| 字号 | 字距 | 行高 | 角色 |
| --- | --- | --- | --- |
| 80px | -0.008em | 1.06 | 首屏大标题 |
| 56px | -0.005em | 1.12 | 章节标题 |
| 48px | -0.003em | 1.08 | 产品名 |
| 40px | -0.001em | 1.08 | 次级标题 |
| 28px | +0.007em | 1.14 | 卡片标题 |
| 24px | +0.009em | 1.17 | 小标题 |
| 21px | +0.011em | 1.38 | 导语 |
| 17px | -0.022em | 1.47 | 正文（基准） |
| 14px | -0.016em | 1.29 | 控件标签 |
| 12px | -0.010em | 1.34 | 说明与法务 |

规律：**越大的字越收紧，中等字号反而轻微放宽**（21–24px 取正值），行高从 1.06 一路开到 1.47 给正文留呼吸。

字重分布：600 出现 214 次，400 出现 127 次，500 仅 16 次。显示级统一 600，不用 700/800 造成压迫感。

## 4. 动效

### 时长刻度

样式表里 transition 时长的出现频次：

```
320ms ×63 · 400ms ×44 · 300ms ×38 · 240ms ×31 · 250ms ×20 · 500ms ×17 · 100ms ×15
```

主刻度是 **240 / 320 / 400 / 500ms**，100ms 只用于即时反馈。

### 驱动方式

`animation-timeline`、`scroll-timeline`、`view-timeline` 的出现次数**都是 0**。也就是说滚动效果不是 CSS 滚动时间线，而是脚本读取滚动位置后改写变换。`will-change` 在产品页高达 172 处，说明大量图层被提前提升到合成层。

### 关键帧家族

按命名可归为五类：

1. **导航飞入/飞出**（flyout slide forward/back、scrim 高度变化、search fade-and-slide）
2. **分页圆点**（dotnav shift / timed dot expand）
3. **颜色过渡**（`animate-color-*` / `animate-background-*`，时长 1s）
4. **缎带落下**（ribbon-drop）
5. **媒体旋转**（inline-media-spin）

颜色过渡单独成族这一点值得注意：他们把「区块换色」当成一等动画，而不是附带效果。

## 5. 组件映射

| 组件 | 文件 | 对应观察 |
| --- | --- | --- |
| `ApHeadline` | `ApHeadline.vue` | 三段式标题（eyebrow / display / lede）+ 渐变字 |
| `ApHero` | `ApHero.vue` | 滚动驱动：标题与展示台不同振幅位移，进度写入 `--apl-p` |
| `ApBar` | `ApBar.vue` | 44px 毛玻璃吸顶条，深色区块上整条反色 |
| `ApPills` | `ApPills.vue` | 药丸分段控件，滑块宽度实测 |
| `ApReveal` | `ApReveal.vue` | 入场：500ms 缓出 + 阶梯延迟 |
| `ApBand` | `ApBand.vue` | 色带：滚动进度驱动的 1s 线性换色 |
| `ApParallax` | `ApParallax.vue` | 视差行：合成层位移 |
| `ApCta` | `ApCta.vue` | 胶囊按钮，焦点环 |

## 6. 实现取舍

1. **滚动用 rAF 合并读取**：passive 监听，一帧只读一次布局，元素离屏时不调度工作。原站的做法类似，但我们的实现只依赖 CSS 变量，不直接在 JS 里写 transform 字符串。
2. **合成层优先**：位移统一 `translate3d`，不碰 `top/left`。
3. **颜色插值走 oklab**：`color-mix(in oklab, ...)` 比 sRGB 直插少一段发灰的中间态。
4. **可访问性**：`prefers-reduced-motion` 与 `.apl-no-motion` 双开关，都会把时长压到 1ms；控件保留 `focus-visible` 轮廓。
5. **前缀隔离**：类名 `apl-`、变量 `--apl-*`，与站内既有的 `ef-` / `efk-` 互不干扰。

## 7. 明确没有做的事

- 没有下载或分发 SF Pro 字体文件。
- 没有复制样式表规则文本、SVG、图片、商标或产品文案；演示内容全部是占位文字。
- 没有抓取私有接口，没有注入脚本；观察对象是公开页面与公开静态资源。
- 抓取到的第三方 CSS 存在 `.analysis/apple/`，已在 `.gitignore` 中排除。
