<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import Icon from '../components/Icon.vue'
import ModuleDemo from '../components/ModuleDemo.vue'
import { lang, t } from '../i18n'
import { toast } from '../lib/toast'
import { UI_EN } from './uiLibraryEn'

interface FileRef {
  label: string
  path: string
}

interface ModuleDoc {
  id: string
  name: string
  group: string
  summary: string
  files: FileRef[]
  points: string[]
}

interface Project {
  id: string
  name: string
  author: string
  authorUrl?: string
  kind?: 'third-party' | 'analysis'
  tagline: string
  description: string
  repo: string
  release: string
  design: string
  demo?: {
    label: string
    url: string
    note: string
    altLabel?: string
    altUrl?: string
    altNote?: string
  }
  stack: string[]
  theme: string
  screenshots: { src: string; caption: string }[]
  modules: ModuleDoc[]
}

const PROJECTS: Project[] = [
  {
    id: 'rhine-music',
    name: 'Rhine Music · Demo',
    author: 'RonaldDeng',
    authorUrl: 'https://github.com/RonaldDeng',
    kind: 'third-party',
    tagline: '本地音乐播放器的 3D 专辑架：三列卡片、无缝切歌与同步歌词。',
    description:
      'MIT 许可的浏览器端音乐播放器 demo，界面基础来自 LBEILC / RhineLabUI。核心是把本地曲库做成可旋转的三维专辑架：真实列布局、CD 与唱片盒的模型与光照、滚轮标尺导航、无缝切歌、同步歌词与亮暗主题。除播放外还做了 PWA 离线、画质档位与启动序列，源码按功能拆在 src/ 下的近百个文件里。本站另有一份按同一版式重写的纯 CSS 视觉复现，见下方 Demo。',
    repo: 'https://github.com/RonaldDeng/Rhine-Music-Demo',
    release: 'https://github.com/RonaldDeng/Rhine-Music-Demo/releases/tag/v0.6.1',
    design: 'https://github.com/RonaldDeng/Rhine-Music-Demo/blob/main/DESIGN.md',
    demo: {
      label: '真实前端（本地 5175）',
      url: 'http://127.0.0.1:5175/?demo=1',
      note: '上游构建的真实应用，靠内置演示封面运行。先执行 npm run demo:rhine 在本机 5175 起服务；没有服务时可切到「界面截图」。',
      altLabel: '界面截图',
      altUrl: '/rhine-gallery.html',
      altNote: '上游 docs/media 的真实截图（远程加载）：亮暗主题、专辑详情、沉浸式歌词与显示设置，不需要本地服务。',
    },
    stack: ['Vue 3', 'TypeScript', 'Three.js', 'Vite', 'MIT'],
    theme: 'Morning Mist / Moon Shadow',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/RonaldDeng/Rhine-Music-Demo/main/docs/media/v0.6.1/album-preview-night.jpg',
        caption: 'Moon Shadow：三列专辑卡与唱片盒预览。',
      },
      {
        src: 'https://raw.githubusercontent.com/RonaldDeng/Rhine-Music-Demo/main/docs/media/v0.6.1/lyrics-night.jpg',
        caption: '沉浸式歌词：时间轴高亮与逐行位移。',
      },
      {
        src: 'https://raw.githubusercontent.com/RonaldDeng/Rhine-Music-Demo/main/docs/media/v0.6.1/settings-display.jpg',
        caption: '显示设置：亮暗主题、画质与动效开关。',
      },
    ],
    modules: [
      {
        id: 'rhine-overview',
        name: '总览与艺术家网格',
        group: '展示',
        summary:
          '总览把曲库摊成艺术家网格与投影视图，边缘卡片会被裁切提示可继续滚动；网格与投影两套布局共用同一份数据。',
        files: [
          { label: 'music-overview.ts', path: 'src/music-overview.ts' },
          { label: 'music-overview.css', path: 'src/music-overview.css' },
          { label: 'music-overview-artist-grid.ts', path: 'src/music-overview-artist-grid.ts' },
          { label: 'music-overview-artists.ts', path: 'src/music-overview-artists.ts' },
          { label: 'music-overview-edge.ts', path: 'src/music-overview-edge.ts' },
          { label: 'music-overview-ui.ts', path: 'src/music-overview-ui.ts' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          '艺术家网格与投影视图共享数据层，切换视图不重新取数。',
          '边缘裁切是刻意的：露出一半的卡片告诉用户后面还有内容。',
          '网格密度随视口变化，但卡片比例保持固定。',
        ],
      },
      {
        id: 'rhine-columns',
        name: '三列专辑架',
        group: '布局',
        summary:
          '「真实列」把专辑按三列排布，列内允许纵向滚动、列间保持独立位置；布局计算在 music-real-columns 与 music-array-layout 里，响应式规则单独一份。',
        files: [
          { label: 'music-real-columns.ts', path: 'src/music-real-columns.ts' },
          { label: 'music-array-layout.ts', path: 'src/music-array-layout.ts' },
          { label: 'viewport-layout.ts', path: 'src/viewport-layout.ts' },
          { label: 'responsive.css', path: 'src/responsive.css' },
          { label: 'music.css', path: 'src/music.css' },
        ],
        points: [
          '列位置是状态而不是纯 CSS：切走再回来会回到原来的列。',
          '布局用视口比例计算，不写死像素宽度。',
          '窄屏时列数减少但卡片比例不变，避免封面被拉伸。',
        ],
      },
      {
        id: 'rhine-cd',
        name: 'CD 与唱片盒',
        group: '三维',
        summary:
          '唱片盒与 CD 是独立模型，带各自的光照与锚点；悬停时碟片从盒中抽出，光照随主题在暖冷之间切换。',
        files: [
          { label: 'music-cd-asset.ts', path: 'src/music-cd-asset.ts' },
          { label: 'music-model.ts', path: 'src/music-model.ts' },
          { label: 'model-viewer.ts', path: 'src/model-viewer.ts' },
          { label: 'archive-lighting.ts', path: 'src/archive-lighting.ts' },
          { label: 'music-lighting.ts', path: 'src/music-lighting.ts' },
        ],
        points: [
          '盒与碟分开建模，抽屉动作是一个独立的时间线。',
          '主题切换同时改光照色温，而不是只换背景色。',
          '模型加载失败时退回封面图，不会留下空槽。',
        ],
      },
      {
        id: 'rhine-player',
        name: '播放与无缝切歌',
        group: '播放',
        summary:
          '播放层封装 Web Audio 与本地文件，无缝切歌用双缓冲预载下一首；音量与音质设置独立成 audio-settings。',
        files: [
          { label: 'music-player.ts', path: 'src/music-player.ts' },
          { label: 'music-browser-gapless.ts', path: 'src/music-browser-gapless.ts' },
          { label: 'audio.ts', path: 'src/audio.ts' },
          { label: 'audio-settings.ts', path: 'src/audio-settings.ts' },
          { label: 'music-transport-title.ts', path: 'src/music-transport-title.ts' },
        ],
        points: [
          '下一首在播放当前曲目时就开始缓冲，切换时听不到空隙。',
          '浏览器不支持时退化为普通切换，不阻塞播放。',
          '文件只在本地读取，不上传服务器。',
        ],
      },
      {
        id: 'rhine-lyrics',
        name: '同步歌词',
        group: '歌词',
        summary:
          '解析同名歌词文件，按时间轴高亮当前行；沉浸模式把歌词铺满画面，逐行位移用文本动效而不是逐字动画。',
        files: [
          { label: 'music-lyrics.ts', path: 'src/music-lyrics.ts' },
          { label: 'music-lyrics-timeline.ts', path: 'src/music-lyrics-timeline.ts' },
          { label: 'music-lyrics.css', path: 'src/music-lyrics.css' },
          { label: 'music-lyrics-immersive.css', path: 'src/music-lyrics-immersive.css' },
          { label: 'music-text-motion.ts', path: 'src/music-text-motion.ts' },
        ],
        points: [
          '时间轴与渲染分离，跳转播放位置不会重建整个歌词列表。',
          '当前行以外整体降透明度，滚动到中间而不是固定在顶部。',
          '沉浸模式的字号随视口缩放，行距保持固定比例。',
        ],
      },
      {
        id: 'rhine-navigation',
        name: '滚轮与标尺',
        group: '交互',
        summary:
          '滚轮驱动列切换，顶部标尺给出位置反馈；滚动带惯性但会吸附到列，触控板与滚轮使用不同的力度曲线。',
        files: [
          { label: 'music-wheel-navigation.ts', path: 'src/music-wheel-navigation.ts' },
          { label: 'music-ruler.ts', path: 'src/music-ruler.ts' },
          { label: 'music-navigation-motion.css', path: 'src/music-navigation-motion.css' },
          { label: 'music-navigation-ruler.css', path: 'src/music-navigation-ruler.css' },
          { label: 'music-order.ts', path: 'src/music-order.ts' },
        ],
        points: [
          '滚轮与触控板分两套系数，避免触控板上一次滚过头。',
          '吸附阈值按列宽比例给，不按固定像素。',
          '标尺只在滚动时出现，停稳后淡出。',
        ],
      },
      {
        id: 'rhine-transitions',
        name: '切歌与转场',
        group: '动效',
        summary:
          '点开专辑是一次视图转场：卡片从列表位置放大到详情，背景与文案分两层进入；切歌时标题与封面各自独立过渡。',
        files: [
          { label: 'music-detail-view-transition.ts', path: 'src/music-detail-view-transition.ts' },
          { label: 'music-song-transition.ts', path: 'src/music-song-transition.ts' },
          { label: 'music-transition-control.css', path: 'src/music-transition-control.css' },
          { label: 'ui-transitions.ts', path: 'src/ui-transitions.ts' },
          { label: 'motion.ts', path: 'src/motion.ts' },
        ],
        points: [
          '详情转场分封面、背景、文案三层，速度略有差异。',
          '减少动态效果时，转场直接停在终态而不是缩短时长。',
          '转场期间禁用滚轮导航，避免双重位移。',
        ],
      },
      {
        id: 'rhine-theme',
        name: '主题与外观',
        group: '主题',
        summary:
          'Morning Mist 与 Moon Shadow 两套主题，切换时背景、玻璃卡与光照一起过渡；主题偏好持久化，下次启动直接命中。',
        files: [
          { label: 'music-theme.css', path: 'src/music-theme.css' },
          { label: 'music-theme-switch.css', path: 'src/music-theme-switch.css' },
          { label: 'theme-transition.ts', path: 'src/theme-transition.ts' },
          { label: 'viewer-theme.ts', path: 'src/viewer-theme.ts' },
          { label: 'appearance.ts', path: 'src/appearance.ts' },
        ],
        points: [
          '主题切换是过渡不是闪烁：颜色与光照同时插值。',
          '玻璃卡的模糊与底色跟着主题变，不是同一套透明度。',
          '偏好写入本地存储，启动时在首帧前应用，避免闪白。',
        ],
      },
      {
        id: 'rhine-boot',
        name: '启动序列',
        group: '启动',
        summary:
          '启动是一段编排好的序列：Logo 轨迹、镜头推进、专辑架就位，各段有独立时间与回调，可被跳过。',
        files: [
          { label: 'boot.ts', path: 'src/boot.ts' },
          { label: 'music-boot.ts', path: 'src/music-boot.ts' },
          { label: 'music-boot.css', path: 'src/music-boot.css' },
          { label: 'music-boot-timing.ts', path: 'src/music-boot-timing.ts' },
          { label: 'boot-motion.ts', path: 'src/boot-motion.ts' },
        ],
        points: [
          '每段动画有自己的时长与回调，序列可单独调试。',
          '用户交互会立即跳过剩余启动段。',
          '启动期间不渲染可交互内容，避免误触。',
        ],
      },
      {
        id: 'rhine-platform',
        name: 'PWA、画质与设置',
        group: '平台',
        summary:
          '离线缓存、画质档位与动效偏好放在同一层：PWA 注册、渲染质量与设置面板互相读取，而不是各自维护一份状态。',
        files: [
          { label: 'pwa.ts', path: 'src/pwa.ts' },
          { label: 'quality-settings.ts', path: 'src/quality-settings.ts' },
          { label: 'quality-settings.css', path: 'src/quality-settings.css' },
          { label: 'render-quality.ts', path: 'src/render-quality.ts' },
          { label: 'music-motion-settings.ts', path: 'src/music-motion-settings.ts' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          '画质档位直接控制渲染参数，不只是开关模糊。',
          '动效偏好同时影响 CSS 过渡与三维动画。',
          '离线缓存只保留应用与封面，不缓存音频。',
        ],
      },
    ],
  },
  {
    id: 'endfield-ui',
    name: 'Endfield UI',
    author: 'icaruszezen',
    authorUrl: 'https://github.com/icaruszezen',
    kind: 'third-party',
    tagline: '《明日方舟：终末地》设计风格文档，以及按文档实现的 React 组件库。',
    description:
      '工业编辑风：纸白或烟黑的底、墨黑的字、一处信号黄，再叠一层克制的印刷与测绘痕迹。仓库包含设计规范、Tailwind v4 主题令牌、React 组件库、Storybook 预览站与文档站；主入口不包含官方素材。',
    repo: 'https://github.com/icaruszezen/endfield-ui',
    release: 'https://www.npmjs.com/package/@endfield-ui/react',
    design: 'https://icaruszezen.github.io/endfield-ui/design/',
    demo: {
      label: '在线 Storybook',
      url: 'https://icaruszezen.github.io/endfield-ui/',
      note: '在线组件预览：控件、母题与示例页，可切换亮暗主题；不需要本地安装。',
    },
    stack: ['React', 'TypeScript', 'Tailwind CSS v4', 'Storybook', 'Base UI'],
    theme: '亮 / 暗 / 反转块',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/icaruszezen/endfield-ui/main/docs/screenshots/depot-dark.png',
        caption: '示例页「仓库」暗色：镂空巨字、楔形页签、物品格与刻度圆环。',
      },
      {
        src: 'https://raw.githubusercontent.com/icaruszezen/endfield-ui/main/docs/screenshots/settings-light.png',
        caption: '示例页「设置」亮色：表单、步骤条与校验反馈。',
      },
    ],
    modules: [
      {
        id: 'ef-foundations',
        name: '设计基础与主题',
        group: '基础',
        summary:
          '纸白 / 烟黑、墨黑与信号黄；亮暗主题、反转块和可替换的强调色，全部落在 Tailwind v4 的 @theme 里。',
        files: [
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
          { label: 'utilities.css', path: 'packages/ui/src/styles/utilities.css' },
          { label: 'useTheme.ts', path: 'packages/ui/src/hooks/useTheme.ts' },
          { label: 'index.css', path: 'packages/ui/src/styles/index.css' },
          { label: 'theme.test.ts', path: 'packages/ui/src/styles/theme.test.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
        ],
        points: [
          '默认亮色；在 <html> 或任意容器写 data-theme="dark" 即可切暗色，标题带用 inverse 反转。',
          '信号黄可整体换成自己的强调色，组件与焦点环同步。',
          '纸、墨、黄的比例被写进规范：颜色只做信号，不铺满界面。',
        ],
      },
      {
        id: 'ef-controls',
        name: '基础控件',
        group: '控件',
        summary:
          'Button、ButtonGroup、Tag、Panel、Toolbar、Kbd、SectionTitle、BracketTitle、Tabs 等基础控件。',
        files: [
          { label: 'Button.tsx', path: 'packages/ui/src/components/button/Button.tsx' },
          { label: 'Tag.tsx', path: 'packages/ui/src/components/tag/Tag.tsx' },
          { label: 'Panel.tsx', path: 'packages/ui/src/components/panel/Panel.tsx' },
          { label: 'Button.test.tsx', path: 'packages/ui/src/components/button/Button.test.tsx' },
          { label: 'ButtonGroup.test.tsx', path: 'packages/ui/src/components/button/ButtonGroup.test.tsx' },
          { label: 'ButtonGroup.tsx', path: 'packages/ui/src/components/button/ButtonGroup.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/button/index.ts' },
          { label: 'Tag.test.tsx', path: 'packages/ui/src/components/tag/Tag.test.tsx' },
          { label: 'TagPair.tsx', path: 'packages/ui/src/components/tag/TagPair.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/tag/index.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
        ],
        points: [
          '切角、楔形、角括号是形状语言，不是装饰贴纸；同一含义在不同控件里复用。',
          '按钮有实心、描边与文字层级，焦点环在亮暗主题下都保持可读。',
          'Tag 用英文承担结构、中文承担阅读，大小写与字距有固定规范。',
        ],
      },
      {
        id: 'ef-forms',
        name: '表单控件',
        group: '表单',
        summary:
          'Input、Select、Combobox、OtpInput、Checkbox、SegmentedControl、Slider、FileUpload 等，含校验与错误状态。',
        files: [
          { label: 'Input.tsx', path: 'packages/ui/src/components/input/Input.tsx' },
          { label: 'SegmentedControl.tsx', path: 'packages/ui/src/components/segmented-control/SegmentedControl.tsx' },
          { label: 'Checkbox.tsx', path: 'packages/ui/src/components/checkbox/Checkbox.tsx' },
          { label: 'Input.test.tsx', path: 'packages/ui/src/components/input/Input.test.tsx' },
          { label: 'control-box.ts', path: 'packages/ui/src/components/input/control-box.ts' },
          { label: 'index.ts', path: 'packages/ui/src/components/input/index.ts' },
          { label: 'value-chip.ts', path: 'packages/ui/src/components/input/value-chip.ts' },
          { label: 'SegmentedControl.test.tsx', path: 'packages/ui/src/components/segmented-control/SegmentedControl.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/segmented-control/index.ts' },
          { label: 'Checkbox.test.tsx', path: 'packages/ui/src/components/checkbox/Checkbox.test.tsx' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
        ],
        points: [
          '输入框的聚焦线从左往右擦出，错误状态用颜色之外的记号再说明一次。',
          '组合框、滑块、验证码等复杂行为交给 Base UI，键盘与读屏可用。',
          '表单控件同时适配亮色、暗色与反转块三种局部主题。',
        ],
      },
      {
        id: 'ef-feedback',
        name: '反馈与浮层',
        group: '反馈',
        summary:
          'Alert、Toast、Progress、Spinner、Skeleton、Dialog、Drawer、Tooltip、Popover 等状态与浮层。',
        files: [
          { label: 'Alert.tsx', path: 'packages/ui/src/components/alert/Alert.tsx' },
          { label: 'Dialog.tsx', path: 'packages/ui/src/components/dialog/Dialog.tsx' },
          { label: 'Progress.tsx', path: 'packages/ui/src/components/progress/Progress.tsx' },
          { label: 'Alert.test.tsx', path: 'packages/ui/src/components/alert/Alert.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/alert/index.ts' },
          { label: 'Dialog.test.tsx', path: 'packages/ui/src/components/dialog/Dialog.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/dialog/index.ts' },
          { label: 'initial-focus.ts', path: 'packages/ui/src/components/dialog/initial-focus.ts' },
          { label: 'overlay-style.ts', path: 'packages/ui/src/components/dialog/overlay-style.ts' },
          { label: 'Progress.test.tsx', path: 'packages/ui/src/components/progress/Progress.test.tsx' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
        ],
        points: [
          '浮层从触发它的那一侧来，进入与退出都在 0.2–0.3 秒内完成，没有回弹。',
          '状态不只靠颜色：图标、文案与形状一起说明成功、警告、错误。',
          '系统开启“减少动态效果”时，过渡直接停在终态。',
        ],
      },
      {
        id: 'ef-display',
        name: '展示与导航',
        group: '展示',
        summary:
          'ItemSlot / ItemGrid、Table、Stat、SideRail、PageHeader、Breadcrumb、Steps、Timeline 等展示与导航组件。',
        files: [
          { label: 'ItemSlot.tsx', path: 'packages/ui/src/components/item-slot/ItemSlot.tsx' },
          { label: 'SideRail.tsx', path: 'packages/ui/src/components/side-rail/SideRail.tsx' },
          { label: 'Stat.tsx', path: 'packages/ui/src/components/stat/Stat.tsx' },
          { label: 'ItemGrid.test.tsx', path: 'packages/ui/src/components/item-slot/ItemGrid.test.tsx' },
          { label: 'ItemGrid.tsx', path: 'packages/ui/src/components/item-slot/ItemGrid.tsx' },
          { label: 'ItemSlot.test.tsx', path: 'packages/ui/src/components/item-slot/ItemSlot.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/item-slot/index.ts' },
          { label: 'SideRail.test.tsx', path: 'packages/ui/src/components/side-rail/SideRail.test.tsx' },
          { label: 'SideRailSub.tsx', path: 'packages/ui/src/components/side-rail/SideRailSub.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/side-rail/index.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
        ],
        points: [
          '物品格用稀有度、库存与角标表达状态，暗色下仍能分辨层级。',
          '表格支持展开行、排序、勾选与行内操作；窄屏侧轨会换成顶栏菜单。',
          '导航控件可以用 render 接路由库的链接组件。',
        ],
      },
      {
        id: 'ef-motifs',
        name: '母题与动效',
        group: '母题',
        summary:
          'CornerBrackets、Viewfinder、GhostText、Hatch、TickRing、HazardStripe 等母题，以及短促、无回弹的动效规范。',
        files: [
          { label: 'decor.ts', path: 'packages/ui/src/lib/decor.ts' },
          { label: 'TickRing.tsx', path: 'packages/ui/src/components/tick-ring/TickRing.tsx' },
          { label: 'GhostText.tsx', path: 'packages/ui/src/components/ghost-text/GhostText.tsx' },
          { label: 'CornerBrackets.tsx', path: 'packages/ui/src/components/corner-brackets/CornerBrackets.tsx' },
          { label: 'TickRing.test.tsx', path: 'packages/ui/src/components/tick-ring/TickRing.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/tick-ring/index.ts' },
          { label: 'GhostText.test.tsx', path: 'packages/ui/src/components/ghost-text/GhostText.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/ghost-text/index.ts' },
          { label: 'CornerBrackets.test.tsx', path: 'packages/ui/src/components/corner-brackets/CornerBrackets.test.tsx' },
          { label: 'index.ts', path: 'packages/ui/src/components/corner-brackets/index.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'package.json', path: 'packages/ui/package.json' },
          { label: 'theme.css', path: 'packages/ui/src/styles/theme.css' },
        ],
        points: [
          '切角、斜楔、角括号、镂空字、斜纹同时是组件与 Tailwind 工具类。',
          '纹理有预算：底纹、测绘刻度只出现在需要强调的区域。',
          '动得短、动得硬：状态变化 0.2–0.3 秒完成，不回弹；减少动态效果时直接到终态。',
          '视觉 Demo 进入时会播放一次：镂空字从左擦除、四角括号依次展开、刻度环旋转点亮、斜纹扫过；点「重播动效」可再看一次。',
        ],
      },
    ],
  },
  {
    id: 'endfield-kit',
    name: 'Endfield Kit · 基于网页分析',
    author: '基于网页分析',
    kind: 'analysis',
    tagline: '把《明日方舟：终末地》官网的字体层级、切角几何与色差字效，重写成 10 个 Vue 组件。',
    description:
      '对官网做的一次被动结构观察：DOM 形状、公开 CSS 的声明值、一次计算样式普查，再由这些数值规律重建组件。只保留结构与节奏——商业字体、美术、文案一律不复制，类名用 efk- 前缀与站内既有的 Endfield 演示区分。产物是 10 个不依赖任何 UI 框架的 Vue 组件加一套 --efk-* 令牌。',
    repo: 'https://github.com/hhdtc/cover-studio',
    release: 'https://github.com/hhdtc/cover-studio/blob/main/docs/endfield-design-system.md',
    design: 'https://github.com/hhdtc/cover-studio/blob/main/docs/endfield-design-system.md',
    demo: {
      label: '完整样式指南',
      url: '#/endfield-kit',
      note: '基于网页分析的完整展示页：令牌、字号阶梯、10 个组件、动效与来源说明；可一键切换「减少动效」。',
    },
    stack: ['Vue 3', 'TypeScript', '原生 CSS', 'clip-path 几何', 'CSS 色差'],
    theme: '墨黑 #191919 / 纸白 / 信号黄 #fffa00',
    screenshots: [
      {
        src: '/endfield-kit/guide-hero.png',
        caption: '样式指南首屏：信号黄色带、色差标题、滚动信息条与读数标签。',
      },
      {
        src: '/endfield-kit/guide-components.png',
        caption: '组件区：切角按钮、楔形页签、读数行、色差标题、标签与图标导轨。',
      },
    ],
    modules: [
      {
        id: 'ek-typography',
        name: '字体与字号阶梯',
        group: '基础',
        summary:
          '原站把字重写进 family 名（如 Novecentosanswide-DemiBold），并用一条 10 → 60px 的阶梯组织版面；行高几乎恒定为 1，显示级字距收到 -0.05em。',
        files: [
          { label: 'tokens.css', path: 'src/endfield-kit/tokens.css' },
          { label: 'kit.css', path: 'src/endfield-kit/kit.css' },
          { label: 'index.ts', path: 'src/endfield-kit/index.ts' },
          { label: 'main.ts', path: 'src/main.ts' },
        ],
        points: [
          '字号令牌 --efk-t-10 … --efk-t-30，对应实测的 10 / 11.25 / 12.5 / 13.75 / 15.6 / 17.5 / 18.75 / 25 / 30px。',
          '显示体紧收（-0.05em），技术标注反而放宽到 0.14em 并全大写——两种字距承担不同信息层级。',
          '商业字体不随仓库分发，页面只给可替换字体栈；需要正式效果请自行授权或换成 OFL 字体。',
        ],
      },
      {
        id: 'ek-geometry',
        name: '切角与形状语言',
        group: '形状',
        summary:
          '切角是全站主语言：按钮双端斜切、页签右缘 55° 楔形、面板四角刻度、标题色带的斜端梯形，含义在不同控件间复用。',
        files: [
          { label: 'EfButton.vue', path: 'src/endfield-kit/EfButton.vue' },
          { label: 'EfPanel.vue', path: 'src/endfield-kit/EfPanel.vue' },
          { label: 'EfTabBar.vue', path: 'src/endfield-kit/EfTabBar.vue' },
          { label: 'index.ts', path: 'src/endfield-kit/index.ts' },
          { label: 'tokens.css', path: 'src/endfield-kit/tokens.css' },
          { label: 'kit.css', path: 'src/endfield-kit/kit.css' },
          { label: 'main.ts', path: 'src/main.ts' },
        ],
        points: [
          '按钮切角由 --efk-btn-notch 控制，三档尺寸各自一套角度；内描边用同形状伪元素保持边缘清晰。',
          '悬停是一道斜向扫光穿过，而不是放大或阴影——与工业 HUD 的克制一致。',
          '面板四角刻度用 ::before/::after 画 L 形，不额外增加 DOM。',
        ],
      },
      {
        id: 'ek-hud',
        name: '读数与导航',
        group: '信息层',
        summary:
          '仪表读数（标签 / 数值 / 单位 / 刻度条）、滚动信息条、状态标签与左侧图标导轨，构成页面的「仪器层」。',
        files: [
          { label: 'EfStat.vue', path: 'src/endfield-kit/EfStat.vue' },
          { label: 'EfMarquee.vue', path: 'src/endfield-kit/EfMarquee.vue' },
          { label: 'EfRail.vue', path: 'src/endfield-kit/EfRail.vue' },
          { label: 'EfTag.vue', path: 'src/endfield-kit/EfTag.vue' },
          { label: 'index.ts', path: 'src/endfield-kit/index.ts' },
          { label: 'tokens.css', path: 'src/endfield-kit/tokens.css' },
          { label: 'kit.css', path: 'src/endfield-kit/kit.css' },
          { label: 'main.ts', path: 'src/main.ts' },
        ],
        points: [
          '读数用等宽数字（tabular-nums），小数位对齐，滑块只做比例提示不做交互。',
          '滚动条复制一份内容，才能在 50% 位移处无缝接回；hover 时暂停。',
          '导轨选中项反色并加左侧黄色刻度，与页签的选中逻辑共用一套语法。',
        ],
      },
      {
        id: 'ek-effects',
        name: '色差与纹理',
        group: '视觉特效',
        summary:
          '原站用内联 SVG 滤镜 url(#red-green) 配合 grayscale + contrast(200) 做通道错位；本库改成纯 CSS：两层通道副本以 screen 混合抖动。',
        files: [
          { label: 'EfGlitch.vue', path: 'src/endfield-kit/EfGlitch.vue' },
          { label: 'kit.css', path: 'src/endfield-kit/kit.css' },
          { label: 'index.ts', path: 'src/endfield-kit/index.ts' },
          { label: 'tokens.css', path: 'src/endfield-kit/tokens.css' },
          { label: 'main.ts', path: 'src/main.ts' },
        ],
        points: [
          '色差默认只在 hover 或 live 时开启，避免整页常驻滤镜拖慢低端设备。',
          '扫描线用 repeating-linear-gradient 叠一层，斜纹 45° 做纸张纹理，都不引入图片。',
          '通道色 --efk-channel-r / --efk-channel-g 是独立令牌，可整体换成冷色或单色。',
        ],
      },
      {
        id: 'ek-motion',
        name: '动效节奏',
        group: '动效',
        summary:
          '入场是四段衰减频闪（1s ease-out forwards），滚动条在 80% 处停顿再回卷，滚动提示 1.6s 呼吸；常规过渡只有 0.2–0.3s。',
        files: [
          { label: 'tokens.css', path: 'src/endfield-kit/tokens.css' },
          { label: 'kit.css', path: 'src/endfield-kit/kit.css' },
          { label: 'EfScrollHint.vue', path: 'src/endfield-kit/EfScrollHint.vue' },
          { label: 'index.ts', path: 'src/endfield-kit/index.ts' },
          { label: 'main.ts', path: 'src/main.ts' },
        ],
        points: [
          'prefers-reduced-motion 下所有时长收到 1ms，另有 .efk-no-motion 全局开关供演示页手动切换。',
          '动效承载状态（入场、循环、提示），不做无意义的位移装饰。',
          '时长与缓动都来自观察值：1s / 6s / 1.6s，缓动 cubic-bezier(1,0,.7,1)。',
        ],
      },
    ],
  },
  {
    id: 'apple-kit',
    name: 'Apple · 排版与动效',
    author: '基于网页分析',
    kind: 'analysis',
    tagline: '从 apple.com、iPad Pro 与 iPhone Duo 三个页面量出版式、字号、材质与动效，重写成 10 个 Vue 组件。',
    description:
      '重点在排版与动效，但不止这两块。对三个公开页面做被动读取——DOM 形状、声明式 CSS 的数值、计算样式普查——得到：734 / 833 / 1068 三档容器宽度与 734 / 1068 主断点、一条每级绑定字距与行高的字号梯级、18–32px 的卡片圆角与 980px 药丸、三档毛玻璃（20 / 20 / 7px 模糊）、以及 240/320/400/500ms 的时长刻度。产品页是 311 张图 + 17 段视频 + 31 个吸顶元素的长文档，首页则是 102 张图短叙事。滚动由 IntersectionObserver + rAF 驱动，进度写进 CSS 变量，动画本身仍是声明式的；SF Pro 不随仓库分发，演示内容全部为占位文字。',
    repo: 'https://github.com/hhdtc/cover-studio',
    release: 'https://github.com/hhdtc/cover-studio/blob/main/docs/apple-design-system.md',
    design: 'https://github.com/hhdtc/cover-studio/blob/main/docs/apple-design-system.md',
    demo: {
      label: '排版动效展示页',
      url: '#/apple-kit',
      note: '基于网页分析：字号梯级、滚动位移、毛玻璃吸顶条、色带过渡与视差；可一键切换「减少动效」。',
    },
    stack: ['Vue 3', 'TypeScript', '原生 CSS', 'IntersectionObserver', 'rAF 进度'],
    theme: '墨黑 #1d1d1f / 浅灰 #f5f5f7 / 蓝 #0071e3',
    screenshots: [
      {
        src: '/apple-kit/guide-hero.png',
        caption: '展示页首屏：大字标题、滚动位移的展示台与药丸控件。',
      },
      {
        src: '/apple-kit/guide-scale.png',
        caption: '字号梯级：每一级同时标注 px、字距与行高。',
      },
      {
        src: '/apple-kit/guide-glass.png',
        caption: '毛玻璃三档：20px / 20px / 7px 模糊，透明度 0.8 / 0.4 / 0.7，带高频底噪才看得出模糊。',
      },
    ],
    modules: [
      {
        id: 'ap-type',
        name: '字号梯级',
        group: '排版',
        summary:
          '连续梯级 12 / 14 / 17 / 21 / 24 / 28 / 40 / 56 / 80px；大字号收紧字距（-0.008em 起），中等字号反而轻微放宽（+0.011em），行高从 1.06 递增到 1.47。',
        files: [
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'ApHeadline.vue', path: 'src/apple-kit/ApHeadline.vue' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '字号、字距、行高是绑定的三元组：单独改字号会把版面的呼吸感破坏掉。',
          '正文 17px/1.47 是基准，控制标签 14px，法务与说明 12px。',
          '显示级字重统一 600（观察值里出现 214 次），不用 700 以上造成过重。',
        ],
      },
      {
        id: 'ap-scroll',
        name: '滚动驱动',
        group: '动效',
        summary:
          '原站没有使用 CSS 滚动时间线（animation-timeline 计数为 0），而是脚本读取滚动位置改写变换。本库同样用 IntersectionObserver 判定可见性、rAF 合并读取、把进度写进 --apl-p。',
        files: [
          { label: 'ApHero.vue', path: 'src/apple-kit/ApHero.vue' },
          { label: 'ApReveal.vue', path: 'src/apple-kit/ApReveal.vue' },
          { label: 'ApParallax.vue', path: 'src/apple-kit/ApParallax.vue' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '滚动监听 passive，一帧只读一次布局；元素离屏时不调度任何工作。',
          '位移用 translate3d 走合成层，不用 top/left 触发重排。',
          '入场是 500ms 的缓出曲线加阶梯延迟，不是逐个元素写死动画。',
        ],
      },
      {
        id: 'ap-material',
        name: '材质与吸顶',
        group: '材质',
        summary:
          '44px 高的吸顶条，用 saturate(180%) blur(20px) 做毛玻璃；经过深色区块时整条反色。产品页统计到 12–20 个 sticky 元素、21–27 处 backdrop-filter。',
        files: [
          { label: 'ApBar.vue', path: 'src/apple-kit/ApBar.vue' },
          { label: 'ApPills.vue', path: 'src/apple-kit/ApPills.vue' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '毛玻璃要同时给 -webkit- 前缀，否则 Safari 上会退化成纯色。',
          '反色不是换主题，只改背景透明度、文字与描边三处，过渡 320ms。',
          '药丸控件用绝对定位的滑块，宽度由 ResizeObserver 实测，避免文字变化后错位。',
        ],
      },
      {
        id: 'ap-color',
        name: '色带与渐变字',
        group: '视觉',
        summary:
          '区块底色随滚动在两种颜色之间过渡（观察值为 1s 线性），标题用 background-clip: text 做双色渐变；两者都不引入图片。',
        files: [
          { label: 'ApBand.vue', path: 'src/apple-kit/ApBand.vue' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '颜色过渡用 color-mix 在 oklab 空间插值，比 sRGB 直插少一段发灰的中间态。',
          '渐变字必须保留 color: transparent 与两个 clip 属性，否则部分浏览器只显示背景。',
          '深色区块上的正文改用 #f5f5f7，不直接用纯白，避免刺眼。',
        ],
      },
      {
        id: 'ap-limits',
        name: '边界与替换',
        group: '说明',
        summary:
          'SF Pro 是苹果专有字体，本库不附带字体文件，字体栈回退到系统界面字体；没有复制样式表文本、图片、商标或产品文案。',
        files: [
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '字体栈以 -apple-system / BlinkMacSystemFont 开头，在 macOS 上自然得到系统字体。',
          '类名前缀 apl-、变量 --apl-*，与站内既有的 ef- / efk- 组件互不干扰。',
          'prefers-reduced-motion 与 .apl-no-motion 都会把时长压到 1ms。',
        ],
      },
      {
        id: 'ap-glass',
        name: '毛玻璃与焦点环',
        group: '材质',
        summary:
          '实测三档玻璃：导航 20px 模糊 / 0.8 透明、蒙层 20px / 0.4、悬浮药丸 7px / 0.7，统一 saturate(180%)。焦点环是「白色 3px 间隙 + 蓝色 5px 外环」的双环写法。',
        files: [
          { label: 'ApGlass.vue', path: 'src/apple-kit/ApGlass.vue' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          '先写不透明底，再用 @supports 包住 backdrop-filter，不支持时不至于变成透明块。',
          '背景透明度用 color-mix 计算，换 tint 色不用同时改十几个 rgba。',
          '焦点环用双层 box-shadow 实现，键盘可达性不依赖 outline 的浏览器差异。',
        ],
      },
      {
        id: 'ap-story',
        name: '吸顶叙事与横向画廊',
        group: '叙事',
        summary:
          '产品页的经典结构：图形列 position: sticky 固定，文案列滚动，进入中部带的段落才点亮；画廊用 scroll-snap-type: x mandatory 一张一张对齐。',
        files: [
          { label: 'ApStickyStory.vue', path: 'src/apple-kit/ApStickyStory.vue' },
          { label: 'ApSnapGallery.vue', path: 'src/apple-kit/ApSnapGallery.vue' },
          { label: 'ApLocalNav.vue', path: 'src/apple-kit/ApLocalNav.vue' },
          { label: 'index.ts', path: 'src/apple-kit/index.ts' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'main.ts', path: 'src/main.ts' },
          { label: 'AppleKitView.vue', path: 'src/views/AppleKitView.vue' },
        ],
        points: [
          'sticky 的 top 要减去全局导航高度，否则图形列会被导航压住一截。',
          '段落点亮用 rootMargin 收窄到视口中带（-42%），比监听滚动计算更省。',
          'scroll-snap 不需要手势库：scroll-snap-align 就够，滚轮与触控板都自然吸附。',
        ],
      },
      {
        id: 'ap-layout',
        name: '版式与节奏',
        group: '版式',
        summary:
          '三档容器宽度 734 / 833 / 1068px，主断点 734 与 1068（样式表里分别出现 717 / 565 次）；布局以 flex 为主（185 次）而非 grid（27 次）；纵向留白几乎都是不对称的，例如 40/84、76/76、90/0。',
        files: [
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'ApMedia.vue', path: 'src/apple-kit/ApMedia.vue' },
        ],
        points: [
          '容器宽度不是断点数字的复制品，而是三档阶梯：窄 734、中 833、宽 1068，超出后交给外边距。',
          '纵向节奏不对称（上 40 / 下 84 这种），让内容像是「落」在区块里，而不是居中放置。',
          'flex 承担绝大多数排布，grid 只用在确实需要二维对齐的地方。',
        ],
      },
      {
        id: 'ap-media',
        name: '媒体与组件形态',
        group: '组件',
        summary:
          '产品页 311 图 / 17 视频 / 81 按钮 / 434 链接 / 31 个吸顶元素；卡片圆角 18 / 28 / 32px，药丸 980px，小控件 5–10px；首页另有 980px 药丸 35 处。',
        files: [
          { label: 'ApMedia.vue', path: 'src/apple-kit/ApMedia.vue' },
          { label: 'ApBuyBar.vue', path: 'src/apple-kit/ApBuyBar.vue' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
        ],
        points: [
          '媒体框用 aspect-ratio 固定比例，圆角 28px，hover 只做 1.01 的轻微放大，不叠阴影。',
          '价格条是悬浮药丸：左价格右按钮，整体 980px 圆角，带毛玻璃与一层柔和投影。',
          '深色页的正文不用纯白（#f5f5f7 出现 402 次），次级文字用 #86868b。',
        ],
      },
      {
        id: 'ap-responsive',
        name: '断点与塌陷',
        group: '响应式',
        summary:
          '同一页面在 390 / 834 / 1600px 下实测：导航在 834 以下塌成汉堡（可见链接 14 → 3，条高 44 → 48px），纵向堆叠块 61 → 113，隐藏元素 309 → 337，而吸顶元素始终是 31 个。',
        files: [
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
          { label: 'tokens.css', path: 'src/apple-kit/tokens.css' },
          { label: 'ApLazyMedia.vue', path: 'src/apple-kit/ApLazyMedia.vue' },
        ],
        points: [
          '塌陷发生在导航层，不在内容层：内容只是从两列变一列，导航直接换成汉堡。',
          '吸顶数量不随宽度变化（31 个），说明吸顶是内容结构，不是桌面专属效果。',
          '图片按同一组断点换素材：549 个 <source> 的 media 只有 max-width:734px、max-width:1068px 和 min-width:0 三种。',
        ],
      },
      {
        id: 'ap-loading',
        name: '媒体加载策略',
        group: '性能',
        summary:
          '17 段视频全部 preload="none" + playsinline、无 poster、无 autoplay 属性，只有 2 段在初始 HTML 里带 src；其余靠 data-inline-media 插件注入。156 张图的 loading="lazy" 数量是 0 —— 原生懒加载完全没用。',
        files: [
          { label: 'ApLazyMedia.vue', path: 'src/apple-kit/ApLazyMedia.vue' },
          { label: 'ApMedia.vue', path: 'src/apple-kit/ApMedia.vue' },
          { label: 'kit.css', path: 'src/apple-kit/kit.css' },
        ],
        points: [
          '视频用 data-inline-media-* 一组属性声明播放时机、退出复位与超时，加载与播放都由脚本调度。',
          '图片走 <picture> + 549 个 <source> 的 srcset 换分辨率，靠 JS 的 onload 控制揭示，而不是 loading="lazy"。',
          '本库的 ApLazyMedia 用 IntersectionObserver 延迟请求，并在 saveData 时退化为手动加载。',
        ],
      },
    ],
  },
  {
    id: 'nerv-ui',
    name: 'NERV UI',
    author: 'TheGreatGildo',
    authorUrl: 'https://github.com/TheGreatGildo',
    kind: 'third-party',
    tagline: '把「军用科研控制台」这一视觉母题做成可复用样式表与 HTML 组件。',
    description:
      'MIT 许可的零依赖样式表 + 自包含 HTML 组件：808 行 CSS，全部颜色、字体、CRT 效果与组件类都在里面。默认状态是纯黑 —— 屏幕在没有数据时保持关闭。组件覆盖事件流、金库卡片、MAGI 三源共识、指标栅格、数据表与紧急模式；完整 Demo 带一个 Three.js 拓扑可视化。仓库是给 AI 智能体用的 skill，SKILL.md 是完整规范。这里把上游文件原样托管在 /nerv-ui/ 下，便于直接看参考实现。',
    repo: 'https://github.com/TheGreatGildo/nerv-ui',
    release: 'https://github.com/TheGreatGildo/nerv-ui',
    design: 'https://github.com/TheGreatGildo/nerv-ui/blob/main/SKILL.md',
    demo: {
      label: '完整 Demo',
      url: '/nerv-ui/demo.html',
      note: '上游 demo.html 原样托管：拓扑图、事件流、金库卡、MAGI 共识、指标与紧急模式。字体走 Google Fonts，需联网。',
    },
    stack: ['HTML / CSS', 'Zero deps', 'CRT effects', 'Three.js (demo)', 'AI agent skill'],
    theme: '纯黑 void + 磷光橙 / 数据绿 / 告警红',
    screenshots: [
      {
        src: '/nerv-ui/shot-demo.png',
        caption: '完整控制台：拓扑图、指标栅格、事件流与三源共识同屏。',
      },
      {
        src: '/nerv-ui/shot-magi.png',
        caption: 'MAGI 三源共识：三列表决，一致/分歧用颜色与文字双重标记。',
      },
      {
        src: '/nerv-ui/shot-log.png',
        caption: '事件流：类型分色、时间戳等宽、右侧区块高度对齐。',
      },
    ],
    modules: [
      {
        id: 'nrv-foundations',
        name: '色彩与字体',
        group: '基础',
        summary:
          '磷光配色各有单一职责：橙 #FF9830 做结构、绿 #50FF50 做数据、青 #20F0FF 做连线、红 #FF3030 只给告警；底色是 #000 加三层极暗面板。字体是明朝体标题 + 等宽正文 + 压缩体印章。',
        files: [
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'LICENSE', path: 'LICENSE' },
        ],
        points: [
          '每个颜色只有一个职责，跨色复用会直接破坏可读性。',
          '文字几乎全部等宽，数字用 tabular 对齐，读起来像仪表而不是文章。',
          '「屏幕默认关闭」：没有数据时保持纯黑，不用占位骨架屏。',
        ],
      },
      {
        id: 'nrv-crt',
        name: 'CRT 效果',
        group: '视觉特效',
        summary:
          '扫描线、暗角、闪烁与辉光全部用 CSS 渐变与动画实现，没有图片；crt-effects.css 可以单独拿走用在任意页面。',
        files: [
          { label: 'crt-effects.css', path: 'components/crt-effects.css' },
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
        ],
        points: [
          '扫描线用 repeating-linear-gradient 叠在内容之上，不拦截指针事件。',
          '辉光是多层 text-shadow / box-shadow 叠加，而不是滤镜。',
          '闪烁与扫描的时长都很短，避免变成干扰阅读的持续动画。',
        ],
      },
      {
        id: 'nrv-console',
        name: '控制台布局与指标',
        group: '布局',
        summary:
          '三列仪表盘：左侧拓扑、中间指标与金库卡、右侧事件流。指标栅格把「值—单位—说明」压成一行，靠颜色和字号区分层级。',
        files: [
          { label: 'metrics-grid.html', path: 'components/metrics-grid.html' },
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
          { label: 'demo.html', path: 'demo.html' },
        ],
        points: [
          '列宽用比例而非固定像素，窄屏时按顺序堆叠。',
          '指标值用大号等宽字，单位小一号且降饱和，避免抢读数。',
          '面板边框只有 1px 且带一点内发光，边界靠亮度而非阴影。',
        ],
      },
      {
        id: 'nrv-data',
        name: '事件流与数据表',
        group: '数据',
        summary:
          '事件流是带类型色的滚动列表，时间戳等宽、金额右对齐；数据表把策略与变形器的表现并排，行高一致、无斑马纹。',
        files: [
          { label: 'event-log.html', path: 'components/event-log.html' },
          { label: 'data-table.html', path: 'components/data-table.html' },
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
        ],
        points: [
          '事件类型靠颜色 + 文字双重编码，不只依赖颜色。',
          '数字列一律右对齐并使用等宽字体，方便纵向扫读。',
          '表格不画竖线，用行高和留白分隔，减少视觉噪音。',
        ],
      },
      {
        id: 'nrv-magi',
        name: 'MAGI 三源与金库卡',
        group: '组件',
        summary:
          'MAGI 共识把三个来源并排表决，一致时整行转绿；金库卡是「单元 + 状态灯 + 关键比率」的紧凑卡片，状态用颜色与文字同时表达。',
        files: [
          { label: 'magi-oracle.html', path: 'components/magi-oracle.html' },
          { label: 'vault-card.html', path: 'components/vault-card.html' },
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
        ],
        points: [
          '三源表决用行内小字标注「一致 / 分歧」，不靠用户从颜色推断。',
          '状态灯是带辉光的小圆点，只有在状态变化时才闪。',
          '卡片内部用等宽字块对齐，右列数值形成一条竖直基准线。',
        ],
      },
      {
        id: 'nrv-emergency',
        name: '紧急模式',
        group: '状态',
        summary:
          '整页切换到告警态：斜纹警示带、六边形横幅、红色覆盖层与更强的扫描线；退出后恢复常态，不残留样式。',
        files: [
          { label: 'nerv-ui.css', path: 'nerv-ui.css' },
          { label: 'demo.html', path: 'demo.html' },
          { label: 'SKILL.md', path: 'SKILL.md' },
        ],
        points: [
          '紧急态是页面级状态，不是单个组件变体。',
          '斜纹用 repeating-linear-gradient 做，角度固定，不需要 SVG。',
          '退出时移除根节点 class，所有副作用随选择器一起消失。',
        ],
      },
    ],
  },
  {
    id: 'nasa-punk',
    name: 'NASA-Punk UI Skill',
    author: 'duanth',
    authorUrl: 'https://github.com/duanth',
    kind: 'third-party',
    tagline: 'NASA 黄金时代复古未来主义设计系统，给 AI 编码智能体的 UI 技能包。',
    description:
      '一套可被 AI 编码智能体直接调用的设计系统技能：米白纸面打底，遇到终端、日志或仪表盘自动切换暗色仪表面；提供印刷文档、控制台与时代色调三套表面语言。参考实现是一个零依赖单文件 HTML，设计语言溯源 1976 年 NASA 图形标准手册与 NTRS 技术报告插图。',
    repo: 'https://github.com/duanth/NASA-Punk-UI-SKILL',
    release: 'https://github.com/duanth/NASA-Punk-UI-SKILL',
    design: 'https://github.com/duanth/NASA-Punk-UI-SKILL/blob/main/SKILL.md',
    demo: {
      label: 'Reference implementation',
      url: '/nasa-punk-reference.html',
      note: '仓库自带的零依赖单文件参考实现，已本地托管；含印刷文档、控制台与图表三种版面。',
    },
    stack: ['HTML / CSS', 'Design tokens', 'SKILL.md', 'Zero deps', 'AI agent skill'],
    theme: 'PRINT / CONSOLE / era grades',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/duanth/NASA-Punk-UI-SKILL/main/docs/preview-hero.png',
        caption: '印刷文档封面：米白纸面、信号红、机构报头与文档道具。',
      },
      {
        src: 'https://raw.githubusercontent.com/duanth/NASA-Punk-UI-SKILL/main/docs/preview-console.png',
        caption: '控制台仪表：深空底、扫描单目镜、星图面板与状态芯片。',
      },
    ],
    modules: [
      {
        id: 'nasa-foundations',
        name: '基础表皮与字体',
        group: '基础',
        summary:
          '信号红 #E4002B、海军蓝 #0B3D91 与磨损烤漆白；Helvetica 标题配等宽模板标签，左对齐、右不齐，禁粉彩与霓虹。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'snippets.css', path: 'references/snippets.css' },
          { label: 'reference.html', path: 'assets/reference.html' },
        ],
        points: [
          '颜色只做信号：纸面、墨线与磨损白占主体，红与蓝用于强调和机构识别。',
          '标题用 Helvetica，规格标签用等宽字体；文案左对齐，右缘保持自然不齐。',
          '每个决定同时通过两层判断：像 1979 年政府技术展，也像今天能发布的产品。',
        ],
      },
      {
        id: 'nasa-print',
        name: '印刷文档层',
        group: 'PRINT',
        summary:
          '默认表面：米白纸面与墨线图表，自动织入至少两件 Band-15 文档道具——报头、备忘录元数据、展带、导视或条码。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'component-matrix.md', path: 'references/component-matrix.md' },
          { label: 'reference.html', path: 'assets/reference.html' },
          { label: 'snippets.css', path: 'references/snippets.css' },
        ],
        points: [
          '页面级底色默认保持浅色，阅读区不铺暗色仪表。',
          '文档道具按内容体裁自动部署：杂志封面、机构公文、阅读页、博物馆展带、GPO 版权页。',
          '报告图表遵循技术插图语法，坐标轴默认关闭，先保证图形可读。',
        ],
      },
      {
        id: 'nasa-console',
        name: '控制台仪表',
        group: 'CONSOLE',
        summary:
          '暗色仪表面 #0A1420，用于终端、日志墙、仪表盘与状态密集簇；含扫描单目镜、星图面板、状态芯片、拉丝金属与传承衬线层。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'reference.html', path: 'assets/reference.html' },
          { label: 'snippets.css', path: 'references/snippets.css' },
        ],
        points: [
          '暗色只附着在仪器型内容上，不用于正文阅读面；整页控制台需显式请求。',
          '状态芯片成三联出现，稀有度使用三色；扫描单目镜与星图面板是标志性组件。',
          '拉丝金属斜面、角螺钉与冷暖分光负责硬件质感，避免霓虹赛博朋克。',
        ],
      },
      {
        id: 'nasa-charts',
        name: '图表与仪表语法',
        group: '图表',
        summary:
          '技术报告插图四阶梯填充、基线柱、带量程弧的模拟表盘、灰／黑白条纹／红三态旗语与磁翻片。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'component-matrix.md', path: 'references/component-matrix.md' },
          { label: 'reference.html', path: 'assets/reference.html' },
          { label: 'snippets.css', path: 'references/snippets.css' },
        ],
        points: [
          '填充阶梯：描边 → 实心 → 45° 影线 → 交叉影线，用同一套语法表达数据层级。',
          '柱图默认贴着基线生长，不画坐标轴；刻度与量程放在图注或表盘弧上。',
          '状态不依赖颜色：灰、黑白条纹、红三种旗语在灰度打印下仍可区分。',
        ],
      },
      {
        id: 'nasa-motion',
        name: '运动节奏与质量门',
        group: '动效',
        summary:
          '注意力状态必须呼吸（2.5s，透明度 .55↔1）；入场 150–250ms ease-out；全页只允许一处 CRT／闪烁特例。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'collision-check.js', path: 'scripts/collision-check.js' },
          { label: 'icon-geometry-check.js', path: 'assets/icon-geometry-check.js' },
          { label: 'snippets.css', path: 'references/snippets.css' },
          { label: 'reference.html', path: 'assets/reference.html' },
        ],
        points: [
          '闪烁是硬失败：需要持续注意的状态用呼吸，不用高频闪烁。',
          '入场短促、ease-out；标题行高与图文碰撞由审计器检查。',
          '零意外遮挡法则 + 碰撞审计 + 强制视觉验证，构成交付前的质量门。',
        ],
      },
      {
        id: 'nasa-emblem',
        name: '时代色调与纹章',
        group: '母题',
        summary:
          '.era-mercury / .era-gemini / .era-apollo 三档时代色调，以及四区纹章公式、Constellation 四色条纹与虚构机构识别。',
        files: [
          { label: 'SKILL.md', path: 'SKILL.md' },
          { label: 'reference.html', path: 'assets/reference.html' },
          { label: 'snippets.css', path: 'references/snippets.css' },
        ],
        points: [
          '时代色调只做令牌级微调：水星冷灰蓝、双子中性钢、阿波罗暖棕褐。',
          '纹章按四区公式组合，机构名与任务章可以使用虚构品牌，但不能使用 NASA 官方徽记。',
          'NASA 徽记与标志是美国政府商标；本仓库只包含虚构的、受启发的品牌。',
        ],
      },
    ],
  },
  {
    id: 'aureole',
    name: 'AUREOLE · Sixth UI',
    author: 'AlphaZero78',
    authorUrl: 'https://github.com/AlphaZero78',
    kind: 'third-party',
    tagline: '从《明日方舟》六周年 PV 前 60 秒提取的交互模板：未来、机械、圣徒。',
    description:
      '把宣传影像里的黑场、银白结构、钴蓝图纸与浅色解构转成可交互的网页模板。主体被拆成透明图像平面，在 CSS 三维空间中持续漂浮；编号引线跟随部件，支持实体观测、结构透视与解构重组三种模式，以及搜索、档案、配置导出和减少动态。',
    repo: 'https://github.com/AlphaZero78/ArknightsSixthUI',
    release: 'https://github.com/AlphaZero78/ArknightsSixthUI',
    design: 'https://github.com/AlphaZero78/ArknightsSixthUI/blob/main/docs/SOURCE-STUDY.md',
    demo: {
      label: '本地交互 Demo',
      url: 'http://127.0.0.1:5176/',
      note: '完整模板运行在本地 5176：可切换三种观测模式、搜索标本、点击编号阅读部件并导出配置。',
    },
    stack: ['React 19', 'Vite', 'CSS 3D', 'Canvas', 'JavaScript'],
    theme: '实体观测 / 结构透视 / 解构重组',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/AlphaZero78/ArknightsSixthUI/main/docs/images/observation.png',
        caption: '实体观测：黑场中的银白图像平面、编号引线与部件档案。',
      },
      {
        src: 'https://raw.githubusercontent.com/AlphaZero78/ArknightsSixthUI/main/docs/images/blueprint.png',
        caption: '结构透视：钴蓝点阵、轮廓、轴线与校准圆。',
      },
    ],
    modules: [
      {
        id: 'aureole-observation',
        name: '实体观测',
        group: '模式',
        summary:
          '黑场中的银白图像平面分别漂浮，编号引线跟随对应结构；点击编号或短句阅读部件档案。',
        files: [
          { label: 'App.jsx', path: 'src/opening/App.jsx' },
          { label: 'Components.jsx', path: 'src/opening/Components.jsx' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '标本主体拆成透明平面，按不同深度与相位漂浮；编号与引线独立成网页图层。',
          '靠近指针或键盘聚焦时，编号与短句的位置会稳定下来，方便点击与阅读。',
          '点击编号定位部件，点击主体旁短句打开完整档案；Escape 收起。',
        ],
      },
      {
        id: 'aureole-blueprint',
        name: '结构透视',
        group: '模式',
        summary:
          '为每个透明图层派生轮廓，叠加钴蓝点阵、轴线、校准圆与选中截面，观察同一主体的结构关系。',
        files: [
          { label: 'LayeredSubject.jsx', path: 'src/opening/LayeredSubject.jsx' },
          { label: 'layerGeometry.js', path: 'src/opening/layerGeometry.js' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '轮廓由前景连通域派生，结构点按所属图层定位，再投影到屏幕。',
          '钴蓝点阵、轴线与校准圆是独立图层，不改变主体材质。',
          '选中截面用于强调当前部件，切换模式时保持同一标本。',
        ],
      },
      {
        id: 'aureole-deconstruct',
        name: '解构重组',
        group: '模式',
        summary:
          '浅色反相层、持续错位的斜切片、独立漂浮的衬线碎字与放射引线，构成第三种观察方式。',
        files: [
          { label: 'App.jsx', path: 'src/opening/App.jsx' },
          { label: 'Components.jsx', path: 'src/opening/Components.jsx' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '浅色反相层与斜切片让同一主体呈现“被拆开阅读”的状态。',
          '衬线碎字与放射引线各自漂浮，仍与主体共享同一时基。',
          '三种模式共享标本、编号与档案数据，只改变呈现层。',
        ],
      },
      {
        id: 'aureole-float',
        name: '漂浮场景与投影',
        group: '动效',
        summary:
          '18 秒基础周期的位姿、CSS 三维变换、指针视差与屏幕投影；减少动态时所有图层直接静止。',
        files: [
          { label: 'useFloatingScene.js', path: 'src/opening/useFloatingScene.js' },
          { label: 'floatingMath.js', path: 'src/opening/floatingMath.js' },
          { label: 'layerGeometry.js', path: 'src/opening/layerGeometry.js' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '图层、短句和碎字使用不同深度与相位，但共用一个连续时基。',
          '指针提供少量额外视角变化；主体投影变化时引线持续更新。',
          '系统减少动态或手动开启后，各层保持静止，搜索与阅读继续可用。',
        ],
      },
      {
        id: 'aureole-annotate',
        name: '标注、搜索与档案',
        group: '交互',
        summary:
          '搜索标本名称、编号与英文标识，调节标注密度，打开部件档案；支持数字键、方向键、/ 与 Escape。',
        files: [
          { label: 'App.jsx', path: 'src/opening/App.jsx' },
          { label: 'data.js', path: 'src/opening/data.js' },
          { label: 'Components.jsx', path: 'src/opening/Components.jsx' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '1 / 2 / 3 切换观测模式，左右方向键切换标本，/ 聚焦搜索，Escape 关闭浮层。',
          '标注密度可调，关闭标注后仍可阅读主体与档案。',
          '标本名称、编号与英文标识都可搜索。',
        ],
      },
      {
        id: 'aureole-settings',
        name: '配置与无障碍',
        group: '系统',
        summary:
          '导出当前界面配置或标本 JSON，开关标注、微量视差与减少动态；桌面与手机保持主体和控制区可见。',
        files: [
          { label: 'App.jsx', path: 'src/opening/App.jsx' },
          { label: 'data.js', path: 'src/opening/data.js' },
          { label: 'ASSETS.md', path: 'docs/ASSETS.md' },
          { label: 'opening.css', path: 'src/opening/opening.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
        ],
        points: [
          '导出包含标本 ID、模式和界面设置；标本记录仍是模板中的虚构数据。',
          '读取并监听系统减少动态偏好，也可在界面参数中手动切换。',
          '手机保持主体与控制区可见；桌面使用完整观测场。',
        ],
      },
    ],
  },
  {
    id: 'p5-ui',
    name: 'p5-ui · Persona 5 UI',
    author: 'q-mona',
    authorUrl: 'https://github.com/q-mona',
    kind: 'third-party',
    tagline: 'Vue 3 的 Persona 5 风格玩具组件库。',
    description:
      '一套红黑白、斜切与剪纸拼贴的 Vue 3 组件库，包含按钮、标题、文字、滑块、开关、消息、通知、返回顶部、分隔符、上传、表格和人群动画。仓库未提供许可证，因此本站只做链接索引与本地评估，不复制其代码、图片或构建产物；组件视觉 Demo 为原创 CSS 重绘。',
    repo: 'https://github.com/q-mona/p5-ui',
    release: 'https://www.npmjs.com/package/p5-ui',
    design: 'https://github.com/q-mona/p5-ui#readme',
    demo: {
      label: '本地文档站（仅评估）',
      url: 'http://127.0.0.1:5177/',
      note: '仓库自带的预构建文档站，仅在本机运行用于评估；未取得再分发许可，不随本站发布。',
    },
    stack: ['Vue 3', 'Vite', 'Sass', 'Canvas', 'npm p5-ui'],
    theme: '红 / 黑 / 白 · 斜切拼贴',
    screenshots: [
      {
        src: '/p5-poster.svg',
        caption: '本站原创封面示意：红黑白斜切与 P5 风格排版，未使用项目素材。',
      },
    ],
    modules: [
      {
        id: 'p5-foundations',
        name: '全局样式与图标',
        group: '基础',
        summary:
          '红黑白基调、斜切与剪纸拼贴、全局字体与 P5 图标；组件共享同一套 Sass 变量与描边。',
        files: [
          { label: 'global.scss', path: 'src/assets/styles/global.scss' },
          { label: 'index.scss', path: 'src/assets/styles/index.scss' },
          { label: 'icon.vue', path: 'src/components/icon/icon.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '红 #e60012、黑与纸白构成主色；斜切、锯齿与描边是主要形状语言。',
          '图标以 SVG 路径提供，按钮与标题共用同一套倾斜与阴影规则。',
          '全局样式独立打包，适合按需引入组件时统一换肤。',
        ],
      },
      {
        id: 'p5-actions',
        name: '按钮、标题与文字',
        group: '组件',
        summary:
          'P5Button、P5Title、P5Text：倾斜按钮、带红色切片的标题与描边文字。',
        files: [
          { label: 'button.vue', path: 'src/components/button/button.vue' },
          { label: 'title.vue', path: 'src/components/title/title.vue' },
          { label: 'text.vue', path: 'src/components/text/text.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '按钮有实心红、黑白描边与悬停位移，按下有短促反馈。',
          '标题用红色斜块与错位排版制造印刷拼贴感。',
          '文字组件提供描边、阴影与倾斜等展示变体。',
        ],
      },
      {
        id: 'p5-controls',
        name: '滑块与开关',
        group: '表单',
        summary:
          'P5Slider 与 P5Switch：粗描边轨道、红色填充与带位移的滑块/开关。',
        files: [
          { label: 'slider.vue', path: 'src/components/slider/slider.vue' },
          { label: 'switch.vue', path: 'src/components/switch/switch.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '滑块轨道使用粗描边与红色进度段，拖拽时数值实时更新。',
          '开关以黑白底与红色滑块表示状态，切换有短促过渡。',
          '两者都暴露 v-model，可直接在表单中使用。',
        ],
      },
      {
        id: 'p5-feedback',
        name: '消息、通知与返回顶部',
        group: '反馈',
        summary:
          'P5Message、P5Notification、P5BackTop：斜切提示条、带角色剪影的通知与返回顶部按钮。',
        files: [
          { label: 'message.vue', path: 'src/components/message/message.vue' },
          { label: 'notification.vue', path: 'src/components/notification/notification.vue' },
          { label: 'backTop.vue', path: 'src/components/backTop/backTop.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '消息以斜切条从边缘进入，自动消失；通知可带角色剪影与标题。',
          '返回顶部在滚动后出现，点击回到页面顶部。',
          '三者都以红黑白与硬边阴影保持统一的 P5 语气。',
        ],
      },
      {
        id: 'p5-layout',
        name: '分隔符、上传与表格',
        group: '布局',
        summary:
          'P5Divider、P5Upload、P5Table：锯齿分隔线、拖拽上传区与斜切表头。',
        files: [
          { label: 'divider.vue', path: 'src/components/divider/divider.vue' },
          { label: 'upload.vue', path: 'src/components/upload/upload.vue' },
          { label: 'table.vue', path: 'src/components/table/table.vue' },
          { label: 'zoom.vue', path: 'src/components/upload/zoom.vue' },
          { label: 'tableItem.vue', path: 'src/components/table/tableItem.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '分隔符用锯齿/斜切代替普通直线，强化拼贴感。',
          '上传区支持点击与拖拽，选中后展示文件与预览。',
          '表格以斜切表头与描边行组织数据，适合做档案式列表。',
        ],
      },
      {
        id: 'p5-motion',
        name: '人群动画与缩放',
        group: '动效',
        summary:
          'Canvas 人群剪影持续移动，配合缩放与斜切过渡，构成页面级的 P5 动势。',
        files: [
          { label: 'crowd.vue', path: 'src/components/canvas/crowd/crowd.vue' },
          { label: 'createCrowd.js', path: 'src/components/canvas/crowd/createCrowd.js' },
          { label: 'zoom.vue', path: 'src/components/upload/zoom.vue' },
          { label: 'upload.vue', path: 'src/components/upload/upload.vue' },
          { label: 'package.json', path: 'package.json' },
          { label: 'index.html', path: 'index.html' },
          { label: 'App.vue', path: 'examples/App.vue' },
        ],
        points: [
          '人群剪影在 Canvas 中持续移动，密度与速度可配置。',
          '缩放/斜切过渡用于图片预览与页面转场，节奏短促。',
          '动效以红黑白剪影为主，不依赖外部图片素材。',
        ],
      },
    ],
  },
  {
    id: 'persona3',
    name: 'Persona3-like-web',
    author: 'Masonli1203',
    authorUrl: 'https://github.com/Masonli1203',
    kind: 'third-party',
    tagline: 'Persona 3 风格的斜切排版作品集模板：自定义光标、玻璃时钟与圆形转场。',
    description:
      'Next.js + TypeScript + Tailwind + Framer Motion 的作品集模板。用粗体斜切排版、漂浮章节导航、墨迹光标、玻璃时钟转场和照片查看器组织内容；附带可交互的 Three.js 空间配置器。仓库只包含原创占位图与通用文案，不包含官方游戏素材；演示数据为虚构内容。',
    repo: 'https://github.com/Masonli1203/Persona3-like-web',
    release: 'https://github.com/Masonli1203/Persona3-like-web',
    design: 'https://github.com/Masonli1203/Persona3-like-web/blob/main/docs/ARCHITECTURE.md',
    demo: {
      label: '本地 Next.js Demo',
      url: 'http://127.0.0.1:5179/',
      note: '完整模板运行在本地 5179，包含首页、创作分类、项目页、3D 配置器与个人资料页。',
    },
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'Three.js'],
    theme: '深蓝 / 青色 / 斜切排版',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/Masonli1203/Persona3-like-web/main/docs/screenshots/home.png',
        caption: '首页：斜切排版、章节导航与玻璃时钟。',
      },
      {
        src: 'https://raw.githubusercontent.com/Masonli1203/Persona3-like-web/main/docs/screenshots/creative.png',
        caption: '创作分类：分类菜单、媒体卡与照片查看器。',
      },
    ],
    modules: [
      {
        id: 'p3-home',
        name: '斜切首页与排版',
        group: '首页',
        summary:
          '粗体 Anton 标题、斜切色块与分层视差；首页串联 hero、宣言、章节预览与作品入口。',
        files: [
          { label: 'home-page.tsx', path: 'src/features/home/home-page.tsx' },
          { label: 'page.tsx', path: 'src/app/page.tsx' },
          { label: 'sections.ts', path: 'src/data/sections.ts' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'creative.ts', path: 'src/data/creative.ts' },
          { label: 'profile.ts', path: 'src/data/profile.ts' },
          { label: 'projects.ts', path: 'src/data/projects.ts' },
          { label: 'site.ts', path: 'src/data/site.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '大标题使用 Anton，正文与标签使用 IBM Plex Mono；字距与行高服务斜切构图。',
          '首屏视差随滚动改变标题与色块位置，但不追求重 3D。',
          '章节预览与首页入口由数据驱动，替换 site.ts / sections.ts 即可换内容。',
        ],
      },
      {
        id: 'p3-motion',
        name: '墨迹光标与玻璃转场',
        group: '动效',
        summary:
          '自定义墨迹光标、按压反馈、圆形遮罩与玻璃时钟转场，页面切换像一次时间跳转。',
        files: [
          { label: 'ink-cursor.tsx', path: 'src/features/navigation/ink-cursor.tsx' },
          { label: 'transition-clock.tsx', path: 'src/features/navigation/transition-clock.tsx' },
          { label: 'page-transition.tsx', path: 'src/features/navigation/page-transition.tsx' },
          { label: 'transitions.css', path: 'src/features/navigation/transitions.css' },
          { label: 'chapter-navigation.tsx', path: 'src/features/navigation/chapter-navigation.tsx' },
          { label: 'circle-overlay.tsx', path: 'src/features/navigation/circle-overlay.tsx' },
          { label: 'glass-geometry.ts', path: 'src/features/navigation/glass-geometry.ts' },
          { label: 'glass-sprites.ts', path: 'src/features/navigation/glass-sprites.ts' },
          { label: 'press-feedback.ts', path: 'src/features/navigation/press-feedback.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '墨迹光标跟随指针，悬停可交互元素时扩张；触屏与减少动态时自动降级。',
          '页面切换使用圆形遮罩 + 玻璃时钟，转场期间锁定滚动。',
          '按压反馈是短促的缩放/位移，不依赖声音或震动。',
        ],
      },
      {
        id: 'p3-chapters',
        name: '章节导航',
        group: '导航',
        summary:
          '固定在边缘的漂浮章节导航，带磁性吸附与当前章节指示；与路由和滚动位置同步。',
        files: [
          { label: 'chapter-navigation.tsx', path: 'src/features/navigation/chapter-navigation.tsx' },
          { label: 'chapter-shell.tsx', path: 'src/components/layout/chapter-shell.tsx' },
          { label: 'chapters.css', path: 'src/components/layout/chapters.css' },
          { label: 'circle-overlay.tsx', path: 'src/features/navigation/circle-overlay.tsx' },
          { label: 'glass-geometry.ts', path: 'src/features/navigation/glass-geometry.ts' },
          { label: 'glass-sprites.ts', path: 'src/features/navigation/glass-sprites.ts' },
          { label: 'ink-cursor.tsx', path: 'src/features/navigation/ink-cursor.tsx' },
          { label: 'page-transition.tsx', path: 'src/features/navigation/page-transition.tsx' },
          { label: 'press-feedback.ts', path: 'src/features/navigation/press-feedback.ts' },
          { label: 'transition-clock.tsx', path: 'src/features/navigation/transition-clock.tsx' },
          { label: 'package.json', path: 'package.json' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '章节标签随页面模块切换，当前项用色块与编号强调。',
          '悬停有磁性位移，点击进入对应章节或路由。',
          '窄屏收为顶部/底部简化导航，保持可操作。',
        ],
      },
      {
        id: 'p3-creative',
        name: '创作分类与照片查看器',
        group: '内容',
        summary:
          '四类创作路由、分类菜单、媒体卡与可翻页的照片查看器；支持本地视频与可选 Mux 播放。',
        files: [
          { label: 'category-gallery.tsx', path: 'src/features/creative/category-gallery.tsx' },
          { label: 'photo-media.tsx', path: 'src/features/creative/photo-media.tsx' },
          { label: 'viewing-session.tsx', path: 'src/features/creative/viewing-session.tsx' },
          { label: 'creative.ts', path: 'src/data/creative.ts' },
          { label: 'catalog.ts', path: 'src/features/creative/catalog.ts' },
          { label: 'category-menu.module.css', path: 'src/features/creative/category-menu.module.css' },
          { label: 'category-menu.tsx', path: 'src/features/creative/category-menu.tsx' },
          { label: 'creative-visual.tsx', path: 'src/features/creative/creative-visual.tsx' },
          { label: 'creative.module.css', path: 'src/features/creative/creative.module.css' },
          { label: 'mux-video-player.tsx', path: 'src/features/creative/mux-video-player.tsx' },
          { label: 'package.json', path: 'package.json' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '分类菜单负责路由与筛选，图库按分类展示媒体卡。',
          '照片查看器支持上一张/下一张，并恢复打开前的滚动位置。',
          '视频默认使用本地占位或可选 Mux；仓库不附带播放 ID 或私人视频。',
        ],
      },
      {
        id: 'p3-projects',
        name: '项目预览与 3D 配置器',
        group: '项目',
        summary:
          '项目索引、案例研究页与 Three.js 空间配置器；3D 代码按需加载，避免拖慢首屏。',
        files: [
          { label: 'project-index.tsx', path: 'src/features/projects/project-index.tsx' },
          { label: 'alcove-configurator.tsx', path: 'src/features/space-configurator/alcove-configurator.tsx' },
          { label: 'alcove-scene.ts', path: 'src/features/space-configurator/alcove-scene.ts' },
          { label: 'projects.ts', path: 'src/data/projects.ts' },
          { label: 'case-contents-dock.tsx', path: 'src/features/projects/case-contents-dock.tsx' },
          { label: 'case-study.css', path: 'src/features/projects/case-study.css' },
          { label: 'catalog.ts', path: 'src/features/projects/catalog.ts' },
          { label: 'alcove-config.ts', path: 'src/features/space-configurator/alcove-config.ts' },
          { label: 'alcove-materials.ts', path: 'src/features/space-configurator/alcove-materials.ts' },
          { label: 'alcove.module.css', path: 'src/features/space-configurator/alcove.module.css' },
          { label: 'package.json', path: 'package.json' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '项目卡进入案例页；案例内容是可替换的示例，不是真实商业项目。',
          '3D 配置器允许切换空间、材质与演示参数，并给出演示估算。',
          'Three.js 与 Mux 播放器动态加载，首屏只保留轻量内容。',
        ],
      },
      {
        id: 'p3-profile',
        name: '个人资料页',
        group: '资料',
        summary:
          '教育、经历、项目、技能与荣誉的占位资料；邮箱与 CV 链接在配置前保持隐藏。',
        files: [
          { label: 'profile.ts', path: 'src/data/profile.ts' },
          { label: 'site.ts', path: 'src/data/site.ts' },
          { label: 'page.tsx', path: 'src/app/(modules)/about/page.tsx' },
          { label: 'creative.ts', path: 'src/data/creative.ts' },
          { label: 'projects.ts', path: 'src/data/projects.ts' },
          { label: 'sections.ts', path: 'src/data/sections.ts' },
          { label: 'package.json', path: 'package.json' },
          { label: 'layout.tsx', path: 'src/app/layout.tsx' },
          { label: 'globals.css', path: 'src/app/globals.css' },
          { label: 'next.config.ts', path: 'next.config.ts' },
        ],
        points: [
          '姓名、头衔、地点与 SEO 元数据集中在 site.ts；简介与经历在 profile.ts。',
          '邮箱与 CV 默认留空且不渲染，避免模板泄露个人信息。',
          '隐私检查脚本会阻止示例中的真实联系方式或私人媒体进入模板。',
        ],
      },
    ],
  },
  {
    id: 'shadcn-ui',
    name: 'shadcn/ui',
    author: 'shadcn',
    authorUrl: 'https://github.com/shadcn',
    kind: 'third-party',
    tagline: '可组合、可访问、可直接改的 React 组件集合。',
    description:
      '不是传统依赖包，而是一套通过 registry 复制进项目的组件源码：React + Tailwind CSS，默认使用 Radix / Base UI 行为层，配好颜色、圆角、间距与键盘交互。组件、示例、区块和主题都可按需添加并直接修改。',
    repo: 'https://github.com/shadcn-ui/ui',
    release: 'https://ui.shadcn.com/docs',
    design: 'https://ui.shadcn.com/docs/components',
    demo: {
      label: '在线文档',
      url: 'https://ui.shadcn.com/',
      note: '官方在线文档：组件示例、主题、区块与安装命令，可直接在浏览器中查看。',
    },
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Base UI', 'Registry'],
    theme: '中性色 / 圆角 / 亮暗主题',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/public/opengraph-image.png',
        caption: 'shadcn/ui：可组合组件与默认主题。',
      },
    ],
    modules: [
      {
        id: 'shadcn-foundations',
        name: '设计基础与主题',
        group: '基础',
        summary:
          'CSS 变量、Tailwind token、圆角与亮暗主题；多种 style（Vega / Nova / Maia 等）共享同一套组件结构。',
        files: [
          { label: 'themes.ts', path: 'apps/v4/registry/themes.ts' },
          { label: 'style-vega.css', path: 'apps/v4/registry/styles/style-vega.css' },
          { label: 'style-nova.css', path: 'apps/v4/registry/styles/style-nova.css' },
          { label: 'style-luma.css', path: 'apps/v4/registry/styles/style-luma.css' },
          { label: 'style-lyra.css', path: 'apps/v4/registry/styles/style-lyra.css' },
          { label: 'style-maia.css', path: 'apps/v4/registry/styles/style-maia.css' },
          { label: 'style-mira.css', path: 'apps/v4/registry/styles/style-mira.css' },
          { label: 'style-rhea.css', path: 'apps/v4/registry/styles/style-rhea.css' },
          { label: 'style-sera.css', path: 'apps/v4/registry/styles/style-sera.css' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          '颜色、圆角、间距都落在 CSS 变量里，组件只引用 token。',
          '亮暗主题通过根级 class 切换，不需要改组件代码。',
          '不同 style 共享组件结构，只替换 token 与少量样式。',
        ],
      },
      {
        id: 'shadcn-core',
        name: '基础组件',
        group: '组件',
        summary:
          'Button、Badge、Card、Input、Label、Separator、Skeleton、Avatar 等日常控件。',
        files: [
          { label: 'button.tsx', path: 'apps/v4/registry/bases/radix/ui/button.tsx' },
          { label: 'card.tsx', path: 'apps/v4/registry/bases/radix/ui/card.tsx' },
          { label: 'badge.tsx', path: 'apps/v4/registry/bases/radix/ui/badge.tsx' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          '组件使用 cva 管理 variant / size，默认样式与业务样式分离。',
          '所有可交互元素都有 focus-visible 与 disabled 状态。',
          '组件源码直接复制进项目，可以按需改结构而不是覆盖样式。',
        ],
      },
      {
        id: 'shadcn-overlays',
        name: '浮层与菜单',
        group: '浮层',
        summary:
          'Dialog、Sheet、Drawer、Popover、Tooltip、DropdownMenu、Command 等浮层，焦点与键盘行为交给底层 primitive。',
        files: [
          { label: 'dialog.tsx', path: 'apps/v4/registry/bases/radix/ui/dialog.tsx' },
          { label: 'popover.tsx', path: 'apps/v4/registry/bases/radix/ui/popover.tsx' },
          { label: 'command.tsx', path: 'apps/v4/registry/bases/radix/ui/command.tsx' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          '浮层默认带遮罩、焦点锁定、Esc 关闭与返回焦点。',
          '动画短促，使用 data-state 驱动进入/退出。',
          'Command 支持搜索、分组与键盘上下选择。',
        ],
      },
      {
        id: 'shadcn-forms',
        name: '表单控件',
        group: '表单',
        summary:
          'Field、Input、Textarea、Select、Combobox、Checkbox、RadioGroup、Switch、Slider、Calendar 与表单校验示例。',
        files: [
          { label: 'field.tsx', path: 'apps/v4/registry/bases/radix/ui/field.tsx' },
          { label: 'select.tsx', path: 'apps/v4/registry/bases/radix/ui/select.tsx' },
          { label: 'checkbox.tsx', path: 'apps/v4/registry/bases/radix/ui/checkbox.tsx' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          'Field 统一 label、描述与错误信息，错误不只靠颜色表达。',
          '复杂控件由底层 primitive 提供键盘与读屏支持。',
          '示例覆盖 React Hook Form、TanStack Form 与 Server Actions。',
        ],
      },
      {
        id: 'shadcn-data',
        name: '数据展示',
        group: '展示',
        summary:
          'Table、Chart、Carousel、Sidebar、Tabs、Accordion、Pagination 与可展开/排序的数据表示例。',
        files: [
          { label: 'table.tsx', path: 'apps/v4/registry/bases/radix/ui/table.tsx' },
          { label: 'chart.tsx', path: 'apps/v4/registry/bases/radix/ui/chart.tsx' },
          { label: 'sidebar.tsx', path: 'apps/v4/registry/bases/radix/ui/sidebar.tsx' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          'Table 只提供结构样式，排序、筛选与分页由 TanStack Table 示例组合。',
          'Chart 封装 Recharts 的容器、tooltip 与图例 token。',
          'Sidebar 支持可折叠、移动端抽屉与键盘操作。',
        ],
      },
      {
        id: 'shadcn-registry',
        name: 'Registry 与区块',
        group: '工程',
        summary:
          '通过 registry 按需添加组件、示例与区块；`npx shadcn add` 把源码写进项目，而不是安装黑盒依赖。',
        files: [
          { label: 'registry.ts', path: 'apps/v4/registry/bases/radix/registry.ts' },
          { label: '__blocks__.json', path: 'apps/v4/registry/__blocks__.json' },
          { label: 'components.json', path: 'apps/v4/components.json' },
          { label: 'package.json', path: 'package.json' },
        ],
        points: [
          'registry 描述每个组件的文件、依赖与目标路径。',
          'CLI 支持组件、示例、区块与主题，可指定 base（Radix / Base UI / React Aria）。',
          '源码进入项目后可自由修改，升级由项目自己控制。',
        ],
      },
    ],
  },
]

const activeProject = ref(PROJECTS[0])
// Start on the project overview; a module is only opened by an explicit route.
const activeModule = ref<ModuleDoc | null>(null)
const shotIndex = ref(0)
const demoOpen = ref(false)
const demoVariant = ref<'main' | 'alt'>('main')
const activeDemo = computed(() => {
  const d = project.value.demo
  if (!d) return undefined
  if (demoVariant.value === 'alt' && d.altUrl) {
    return { label: d.altLabel ?? d.label, url: d.altUrl, note: d.altNote ?? d.note }
  }
  return d
})
const demoUrl = computed(() => activeDemo.value?.url ?? project.value.repo)

const project = computed<Project>(() => {
  const p = activeProject.value
  if (lang.value === 'zh') return p
  const e = UI_EN[p.id]
  if (!e) return p
  return {
    ...p,
    tagline: e.tagline,
    description: e.description,
    theme: e.theme,
    demo: p.demo
      ? { ...p.demo, label: e.demoLabel ?? p.demo.label, note: e.demoNote ?? p.demo.note }
      : p.demo,
    screenshots: p.screenshots.map((shot, i) => ({ ...shot, caption: e.shots[i] ?? shot.caption })),
    modules: p.modules.map((m) => ({ ...m, ...(e.modules[m.id] ?? {}) })),
  }
})
const query = ref('')
const q = computed(() => query.value.trim().toLowerCase())

const matches = (text?: string) => Boolean(q.value) && (text ?? '').toLowerCase().includes(q.value)

const filteredProjects = computed(() => {
  if (!q.value) return PROJECTS
  return PROJECTS.filter(
    (p) =>
      matches(p.name) ||
      matches(p.tagline) ||
      matches(p.description) ||
      matches(p.author) ||
      p.stack.some((s) => matches(s)) ||
      p.modules.some((m) => matches(m.name) || matches(m.summary) || matches(m.group)),
  )
})

/** Cross-project module matches, so a search can jump straight to a module. */
const moduleHits = computed(() => {
  if (!q.value) return [] as { project: Project; module: ModuleDoc }[]
  const hits: { project: Project; module: ModuleDoc }[] = []
  for (const p of PROJECTS) {
    for (const m of p.modules) {
      if (matches(m.name) || matches(m.summary) || matches(m.group)) hits.push({ project: p, module: m })
    }
  }
  return hits.slice(0, 24)
})

function shortRepo(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const currentModule = computed(
  () => project.value.modules.find((m) => m.id === activeModule.value?.id) ?? null,
)
const currentShot = computed(
  () => project.value.screenshots[shotIndex.value] ?? project.value.screenshots[0],
)
const groupedModules = computed(() => {
  const groups = []
  for (const m of project.value.modules) {
    let g = groups.find((item) => item.name === m.group)
    if (!g) {
      g = { name: m.group, items: [] }
      groups.push(g)
    }
    g.items.push(m)
  }
  return groups
})

function selectProject(p: Project) {
  activeProject.value = p
  // Project landing shows the overview; a module is chosen explicitly.
  activeModule.value = null
  shotIndex.value = 0
  demoOpen.value = false
  demoVariant.value = 'main'
  syncRoute()
}

function projectHref(p: Project) {
  return `#/ui/${p.id}`
}

function moduleHref(p: Project, m: ModuleDoc) {
  return `#/ui/${p.id}/${m.id}`
}

function selectModule(m: ModuleDoc) {
  activeModule.value = m
  syncRoute()
}

function parseRoute() {
  if (!window.location.hash.startsWith('#/ui')) return
  const parts = window.location.hash.replace(/^#\/?/, '').split('/')
  const p = PROJECTS.find((item) => item.id === parts[1]) ?? PROJECTS[0]
  activeProject.value = p
  // No module segment means the project overview, not "first module".
  activeModule.value = parts[2] ? (p.modules.find((item) => item.id === parts[2]) ?? null) : null
  // A module id that no longer exists falls back to the project overview and
  // the stale segment is dropped from the URL.
  if (parts[2] && !activeModule.value) {
    window.history.replaceState(null, '', `#/ui/${p.id}`)
  }
}

function syncRoute() {
  const target = activeModule.value
    ? `#/ui/${activeProject.value.id}/${activeModule.value.id}`
    : `#/ui/${activeProject.value.id}`
  if (window.location.hash !== target) window.location.hash = target
}

onMounted(() => {
  parseRoute()
})

onActivated(() => {
  window.addEventListener('hashchange', parseRoute)
  parseRoute()
  if (!window.location.hash.startsWith('#/ui/')) syncRoute()
})

onDeactivated(() => {
  window.removeEventListener('hashchange', parseRoute)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', parseRoute)
})

function fileUrl(path: string) {
  return `${project.value.repo}/blob/main/${path}`
}

const aiContext = computed(() => {
  const p = project.value
  const m = currentModule.value
  if (!m) return ''
  const route = `${location.origin}${location.pathname}#/ui/${p.id}/${m.id}`
  const licenseLine =
    p.id === 'p5-ui'
      ? 'license: NO LICENSE — all rights reserved; link-only, no code/assets copied'
      : p.id === 'nasa-punk'
        ? 'license: MIT; NASA insignia are U.S. Government marks'
        : p.id === 'endfield-kit'
          ? 'license: original implementation; no third-party assets, fonts or copy'
          : 'license: MIT (non-code assets excluded)'
  const lines = [
    `route: ${route}`,
    `project: ${p.name} (${p.id})`,
    `module: ${m.name} (${m.id})`,
    `group: ${m.group}`,
    `source: ${p.repo}`,
    `demo: ${p.demo?.url?.startsWith('/') ? `${location.origin}${p.demo.url}` : (p.demo?.url ?? p.repo)}`,
    licenseLine,
    'catalog: /ui-catalog.json',
  ]
  if (p.id === 'endfield-ui') {
    lines.push('package: @endfield-ui/react', 'install: pnpm add @endfield-ui/react')
  } else if (p.id === 'nasa-punk') {
    lines.push(
      'runtime: single-file static HTML hosted by this site',
      'license-note: NASA insignia and logotypes are U.S. Government marks; use fictional branding only',
    )
  } else if (p.id === 'aureole') {
    lines.push('runtime: React 19 + Vite preview at http://127.0.0.1:5176/')
  } else if (p.id === 'p5-ui') {
    lines.push('runtime: local static docs at http://127.0.0.1:5177/ (evaluation only)')
  } else if (p.id === 'persona3') {
    lines.push('runtime: Next.js 16 local server at http://127.0.0.1:5179/')
  } else if (p.id === 'shadcn-ui') {
    lines.push('runtime: online documentation at https://ui.shadcn.com/')
  } else if (p.id === 'endfield-kit') {
    lines.push(
      'runtime: Vue 3 SFCs compiled into this site at src/endfield-kit/',
      'import: import { EfButton, EfPanel } from "./endfield-kit"',
      'styles: src/endfield-kit/tokens.css + kit.css; classes prefixed efk-, tokens --efk-*',
      'analysis: docs/endfield-design-system.md',
    )
  } else {
    lines.push('runtime: local Vite + Node music server, visual demo ?demo=1')
  }
  lines.push('files:')
  m.files.forEach((f) => lines.push(`- ${f.path} — ${fileUrl(f.path)}`))
  lines.push('summary:', m.summary, 'usage:')
  m.points.forEach((point) => lines.push(`- ${point}`))
  return lines.join('\n')
})

async function copyAiContext() {
  try {
    await navigator.clipboard.writeText(aiContext.value)
    toast(t('已复制组件上下文', 'Component context copied'))
  } catch {
    toast(aiContext.value)
  }
}
</script>

<template>
  <div class="view ui-lib">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 07</span>
        <strong>{{ t('UI 组件库', 'UI Library') }}</strong>
      </div>
      <span class="view-sub">{{ t('项目总览、模块演示与设计要点', 'Project overview, module demos and design notes') }}</span>
      <div class="toolbar-actions">
        <a class="soft-btn" :href="project.repo" target="_blank" rel="noreferrer">
          {{ t('打开仓库', 'Repository') }}
        </a>
      </div>
    </header>

    <div class="view-body">
      <aside class="panel sm">
        <div class="panel-header">
          <h3>{{ t('收录项目', 'Projects') }}</h3>
          <span class="count">{{ q ? filteredProjects.length + '/' + PROJECTS.length : PROJECTS.length }}</span>
        </div>
        <div class="lib-search">
          <input
            v-model="query"
            type="search"
            class="lib-search-input"
            :placeholder="t('搜索项目 / 模块…', 'Search projects / modules…')"
            :aria-label="t('搜索项目或模块', 'Search projects or modules')"
          />
          <button v-if="query" class="lib-search-clear" type="button" :aria-label="t('清空搜索', 'Clear search')" @click="query = ''">✕</button>
        </div>
        <div class="panel-scroll">
          <a
            v-for="p in filteredProjects"
            :key="p.id"
            class="lib-project"
            :class="{ active: p.id === project.id }"
            :href="projectHref(p)"
          >
            <span class="lib-project-name">{{ p.name }}</span>
            <span class="lib-project-author">{{ p.author }}</span>
            <span class="lib-project-meta">{{ p.stack.slice(0, 2).join(' · ') }}</span>
          </a>
          <div v-if="q && !filteredProjects.length" class="lib-future">{{ t('没有匹配的项目', 'No matching projects') }}</div>
          <div v-if="!q" class="lib-future">{{ t('更多项目待收录', 'More projects coming') }}</div>

          <template v-if="q">
            <div class="panel-header lib-module-head">
              <h3>{{ t('匹配模块', 'Matching modules') }}</h3>
              <span class="count">{{ moduleHits.length }}</span>
            </div>
            <a
              v-for="hit in moduleHits"
              :key="hit.project.id + hit.module.id"
              class="lib-hit"
              :href="moduleHref(hit.project, hit.module)"
            >
              <span class="lib-hit-project">{{ hit.project.name }}</span>
              <span class="lib-hit-name">{{ hit.module.name }}</span>
            </a>
            <div v-if="!moduleHits.length" class="lib-future">{{ t('没有匹配的模块', 'No matching modules') }}</div>
          </template>

          <div v-if="!q" class="panel-header lib-module-head">
            <h3>{{ t('模块索引', 'Modules') }}</h3>
            <span class="count">{{ project.modules.length }}</span>
          </div>
          <a
            v-for="m in (q ? [] : project.modules)"
            :key="m.id"
            class="lib-module"
            :class="{ active: currentModule?.id === m.id }"
            :href="moduleHref(project, m)"
          >
            <span class="lib-module-dot" />
            <span class="lib-module-name">{{ m.name }}</span>
            <span class="lib-module-group">{{ m.group }}</span>
          </a>
        </div>
      </aside>

      <main class="lib-content">
        <section class="lib-hero">
          <div class="lib-hero-copy">
            <span class="lib-eyebrow">PROJECT / {{ project.id }}</span>
            <div class="lib-origin">
              <span class="lib-origin-badge" :class="project.kind === 'analysis' ? 'is-analysis' : 'is-repo'">
                {{ project.kind === 'analysis' ? t('基于网页分析', 'From web analysis') : t('第三方仓库', 'Third-party repository') }}
              </span>
              <span v-if="project.kind !== 'analysis'" class="lib-origin-author">
                {{ t('作者', 'by') }}
                <a v-if="project.authorUrl" :href="project.authorUrl" target="_blank" rel="noreferrer">@{{ project.author }}</a>
                <strong v-else>{{ project.author }}</strong>
              </span>
              <a class="lib-origin-repo" :href="project.repo" target="_blank" rel="noreferrer">{{ shortRepo(project.repo) }} ↗</a>
            </div>
            <h1>{{ project.name }}</h1>
            <p class="lib-tagline">{{ project.tagline }}</p>
            <p class="lib-desc">{{ project.description }}</p>
            <div class="lib-tags">
              <span v-for="s in project.stack" :key="s" class="chip">{{ s }}</span>
              <span class="chip">{{ project.theme }}</span>
            </div>
            <div class="lib-links">
              <a class="soft-btn" :href="project.repo" target="_blank" rel="noreferrer">{{ t('GitHub 仓库', 'GitHub repository') }}</a>
              <a class="soft-btn" :href="project.release" target="_blank" rel="noreferrer">{{ project.id === 'rhine-music' ? 'V0.5.0 Release' : project.id === 'endfield-ui' ? 'npm' : t('仓库', 'Repository') }}</a>
              <a class="soft-btn" :href="project.design" target="_blank" rel="noreferrer">{{ t('设计说明', 'Design docs') }}</a>
            </div>
          </div>

          <figure class="lib-shot">
            <img
              :src="currentShot.src"
              :alt="currentShot.caption"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <figcaption>
              <span>{{ currentShot.caption }}</span>
            </figcaption>
            <div v-if="project.screenshots.length > 1" class="lib-shot-dots">
              <button
                v-for="(s, i) in project.screenshots"
                :key="s.src"
                :class="{ active: i === shotIndex }"
                @click="shotIndex = i"
              />
            </div>
          </figure>
        </section>

        <section v-if="!currentModule" class="lib-overview">
          <div class="lib-overview-head">
            <span class="lib-eyebrow">OVERVIEW / {{ groupedModules.length }} {{ t('个分组', 'groups') }}</span>
            <h2>{{ t('项目总览：先看全貌，再进模块', 'Project overview: the whole shape first') }}</h2>
            <p>
              {{
                t(
                  '当前 URL 停在项目层，没有选中任何模块。下面按分组汇总全部模块，每个名字都是可直接访问的链接；点进任意模块才会出现演示与文件清单。',
                  'The URL stops at the project, with no module selected. Modules are grouped below and every name is a real link; demos and file manifests appear only once you open one.',
                )
              }}
            </p>
          </div>
          <div class="lib-groups">
            <article v-for="g in groupedModules" :key="g.name" class="lib-group">
              <h3>{{ g.name }} <span class="count">{{ g.items.length }}</span></h3>
              <ul>
                <li v-for="m in g.items" :key="m.id">
                  <a :href="moduleHref(project, m)">{{ m.name }}</a>
                  <span>{{ m.summary }}</span>
                </li>
              </ul>
            </article>
          </div>
          <div class="lib-overview-foot">
            <p>
              {{
                t(
                  '机器可读索引：/ui-catalog.json 列出全部项目、模块与路由，抓取一次即可枚举所有 URL。',
                  'Machine-readable index: /ui-catalog.json lists every project, module and route, so one fetch enumerates all URLs.',
                )
              }}
            </p>
            <a v-if="project.demo?.url" class="soft-btn" :href="project.demo.url" target="_blank" rel="noreferrer">
              {{ t('打开项目 Demo', 'Open project demo') }}
            </a>
          </div>
        </section>

        <section class="lib-live">
          <div class="lib-live-head">
            <div>
              <span class="lib-eyebrow">DEMO</span>
              <h2>{{ project.name }} · {{ activeDemo?.label }}</h2>
              <p>{{ activeDemo?.note }}</p>
            </div>
            <div class="lib-live-actions">
              <div v-if="project.demo?.altUrl" class="lib-demo-switch">
                <button :class="{ active: demoVariant === 'main' }" @click="demoVariant = 'main'">{{ t('默认', 'Default') }}</button>
                <button :class="{ active: demoVariant === 'alt' }" @click="demoVariant = 'alt'">{{ project.demo?.altLabel ?? t('备用', 'Alternate') }}</button>
              </div>
              <a class="soft-btn" :href="demoUrl" target="_blank" rel="noreferrer">{{ t('新窗口打开', 'Open in new tab') }}</a>
              <button class="soft-btn" @click="demoOpen = !demoOpen">
                {{ demoOpen ? t('收起 Demo', 'Collapse demo') : t('在页面内打开', 'Open in page') }}
              </button>
            </div>
          </div>
          <template v-if="demoOpen">
            <iframe
              :src="demoUrl"
              class="lib-live-frame"
              :title="project.name + ' demo'"
              allow="autoplay; fullscreen"
            />
            <p class="lib-note">
              <template v-if="project.id === 'rhine-music'">
                {{ t('站内是自研的纯 CSS 复现，不需要 WebGL，也不会读取你的音乐目录。', 'This is a pure-CSS recreation: no WebGL, and it never reads your music folder.') }}
              </template>
              <template v-else>
                {{ t('如果内嵌页面空白，请用「新窗口打开」；在线项目首次加载可能较慢。', 'If the embedded page is blank, open it in a new tab; online projects may take a while on first load.') }}
              </template>
            </p>
          </template>
          <button v-else class="lib-live-poster" @click="demoOpen = true">
            <img :src="project.screenshots[0].src" alt="" loading="lazy" />
            <span class="lib-live-cta">
              <span class="lib-live-play">▶</span>
              <strong>{{ t('在页面内打开 Demo', 'Open demo in page') }}</strong>
              <small>{{ activeDemo?.label }}</small>
            </span>
          </button>
        </section>

        <section v-if="project.id === 'rhine-music'" class="lib-run">
          <div>
            <h2>{{ t('运行真实前端', 'Run the real app') }}</h2>
            <p>
              {{ t('上游构建已经 clone 到 demos/rhine-music-demo 并完成 npm ci 与 build；用一条命令在本机 5175 起服务，页面默认带 ?demo=1，用内置封面直接看到专辑架。', 'The upstream build is cloned into demos/rhine-music-demo and already installed and built; one command serves it on port 5175, and the demo URL carries ?demo=1 so the shelf shows built-in covers immediately.') }}
            </p>
            <ol>
              <li><code>npm run demo:rhine</code></li>
              <li>{{ t('打开 http://127.0.0.1:5175/?demo=1；首次进入有进场动画，点「跳过进场」可直接看架。', 'Open http://127.0.0.1:5175/?demo=1; the first visit plays an intro, and 「跳过进场」 skips straight to the shelf.') }}</li>
              <li>{{ t('需要支持 WebGL 2 的浏览器；没有本地服务时用「界面截图」看静态结果。', 'A WebGL 2 browser is required; without the local server use the screenshot gallery.') }}</li>
            </ol>
            <p class="lib-note">
              {{ t('模型、MiSans 字体、音频与官方美术不在 MIT 范围内，只在本地运行，不随本站仓库分发。', 'Models, MiSans, audio and official artwork are outside the MIT licence; they run locally and are never distributed with this site.') }}
            </p>
          </div>
          <div class="lib-run-side">
            <span class="lib-eyebrow">DEMO NOTES</span>
            <strong>{{ t('真实构建，本地端口', 'Real build, local port') }}</strong>
            <p>{{ t('内置演示封面不读取你的音乐目录；要播放自己的曲库需在应用里选择文件夹。', 'Built-in demo covers never read your music folder; playing your own library requires picking a folder in the app.') }}</p>
          </div>
        </section>

        <section v-if="project.id === 'endfield-ui'" class="lib-run">
          <div>
            <h2>{{ t('在线预览与本地开发', 'Online preview & local development') }}</h2>
            <p>
              {{ t('预览站由 Storybook 构建，直接在线浏览控件、母题和示例页；本地开发需要 pnpm 与 Node 22+。', 'The preview is a Storybook build: browse controls, motifs and example pages online; local development needs pnpm and Node 22+.') }}
            </p>
            <ol>
              <li><code>pnpm install</code></li>
              <li><code>pnpm dev</code> — {{ t('打开 Storybook 组件预览', 'open the Storybook preview') }}</li>
              <li><code>pnpm dev:site</code> — {{ t('打开设计文档站', 'open the design docs site') }}</li>
              <li>{{ t('组件库用法见 packages/ui/README.md，包名 @endfield-ui/react。', 'Usage lives in packages/ui/README.md; package @endfield-ui/react.') }}</li>
            </ol>
            <p class="lib-note">
              {{ t('代码采用 MIT；「Game 实机风格」独立入口包含约 30 张官方图片，不随 MIT 授权，使用前请阅读仓库的 NOTICE 与风险说明。', 'Code is MIT. The separate Game style entry bundles ~30 official images not covered by MIT; read its NOTICE and risk notes before use.') }}
            </p>
          </div>
          <div class="lib-run-side">
            <span class="lib-eyebrow">PACKAGE NOTES</span>
            <strong>React + Tailwind CSS v4</strong>
            <p>{{ t('组件主入口不含官方素材；主题色可整体替换，亮暗与反转块通过 data-theme 控制。', 'The main entry ships no official assets; the accent is replaceable, and light/dark/inverse use data-theme.') }}</p>
          </div>
        </section>

        <!-- Only inside a module: the project overview already lists every
             module, so showing both would repeat the same content. -->
        <section v-if="currentModule" class="lib-section">
          <div class="lib-section-head">
            <h2>{{ t('切换到其他模块', 'Switch module') }}</h2>
            <p>{{ t('当前模块之外的其余模块，点击卡片直接跳转。', 'The rest of this project; pick a card to jump straight there.') }}</p>
          </div>
          <div class="lib-grid">
            <a
              v-for="m in project.modules"
              :key="m.id"
              class="lib-card"
              :class="{ active: currentModule?.id === m.id }"
              :href="moduleHref(project, m)"
            >
              <span class="lib-card-group">{{ m.group }}</span>
              <strong>{{ m.name }}</strong>
              <p>{{ m.summary }}</p>
              <span class="lib-card-files">{{ m.files.length }} {{ t('个相关文件', 'related files') }}</span>
            </a>
          </div>
        </section>

        <section v-if="currentModule" class="lib-detail" :data-project="project.id" :data-module="currentModule.id">
          <div class="lib-detail-head">
            <div>
              <span class="lib-eyebrow">{{ currentModule.group }} / MODULE</span>
              <h2>{{ currentModule.name }}</h2>
            </div>
            <span class="chip">{{ currentModule.files.length }} {{ t('个相关文件', 'related files') }}</span>
          </div>
          <p class="lib-detail-summary">{{ currentModule.summary }}</p>

          <div class="lib-ai">
            <div class="lib-ai-head">
              <div>
                <span class="lib-eyebrow">AI CONTEXT</span>
                <strong>{{ t('给 AI 的组件上下文', 'Component context for AI') }}</strong>
              </div>
              <button class="soft-btn" @click="copyAiContext">{{ t('复制上下文', 'Copy context') }}</button>
            </div>
            <pre>{{ aiContext }}</pre>
          </div>

          <ModuleDemo :id="currentModule.id" :label="currentModule.name" :demo-url="project.demo?.url" />

          <div class="lib-detail-grid">
            <div class="lib-detail-block">
              <h3>{{ t('使用要点', 'Usage notes') }}</h3>
              <ul>
                <li v-for="(p, i) in currentModule.points" :key="i">{{ p }}</li>
              </ul>
            </div>
            <div class="lib-detail-block">
              <h3>{{ t('相关文件', 'Source files') }}</h3>
              <ul class="lib-files">
                <li v-for="f in currentModule.files" :key="f.path">
                  <a :href="fileUrl(f.path)" target="_blank" rel="noreferrer">
                    <Icon name="text" :size="13" />
                    {{ f.label }}
                  </a>
                  <code>{{ f.path }}</code>
                </li>
              </ul>
            </div>
          </div>

          <p class="lib-disclaimer">
            {{ t('相关文件＝模块自身文件＋运行所需的共享依赖（样式令牌、入口接线、清单与构建配置），按项目源码树逐个核对；具体 API 仍以源码为准，这里不复制项目代码。', 'Related files = the module\u2019s own files plus the shared dependencies it needs to run (style tokens, entry wiring, manifest, build config), checked against each project\u2019s source tree. The source stays authoritative; no project code is copied here.') }}
          </p>
        </section>
      </main>
    </div>
  </div>
</template>
