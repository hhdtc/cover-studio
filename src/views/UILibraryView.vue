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
    name: 'Rhine Music · Windows',
    tagline: 'Rhine Music 的 Windows 桌面移植版：同步歌词、歌单与播放队列。',
    description:
      '由 Bong712 维护的 Windows 移植版，界面基础来自 RonaldDeng / LBEILC 的 RhineLabUI。它在三维专辑架与本机播放之上加入同步 LRC 歌词、歌单和可编辑播放队列，并优化了封面图集与实例化绘制。这里展示的是纯视觉演示模式。',
    repo: 'https://github.com/Bong712/Rhine-Music-Windows',
    release: 'https://github.com/Bong712/Rhine-Music-Windows/releases',
    design: 'https://github.com/Bong712/Rhine-Music-Windows/blob/main/README.md',
    demo: {
      label: '自研实现（CSS 3D）',
      url: '/rhine-mock.html',
      note: '按原产品的布局与交互逆向重写：3D 玻璃专辑架、HUD、详情、亮暗主题、开场；使用 5 张本地 mock 封面，不依赖 WebGL。',
      altLabel: '真实前端（WebGL）',
      altUrl: 'http://127.0.0.1:5178/?demo=1',
      altNote: '原项目 Windows 前端；在部分 GPU/驱动上 3D 封面纹理可能显示为空白。',
    },
    stack: ['TypeScript', 'WebGL 2', 'WebView2', 'Three.js', 'LRC 歌词'],
    theme: 'Windows 0.6.0 · 晨雾 / 月影',
    screenshots: [
      {
        src: 'https://raw.githubusercontent.com/RonaldDeng/Rhine-Music-Demo/main/docs/media/v0.5.0/album-preview-night.jpg',
        caption: '月影主题：三维专辑架（界面基础来自上游 V0.5.0，Windows 版沿用）',
      },
      {
        src: 'https://raw.githubusercontent.com/RonaldDeng/Rhine-Music-Demo/main/docs/media/v0.5.0/album-preview-morning.jpg',
        caption: '晨雾主题：玻璃专辑盒与浏览位置（上游界面基础）',
      },
    ],
    modules: [
      {
        id: 'shelf',
        name: '三维专辑架',
        group: '场景',
        summary:
          '把专辑按列铺进三维空间，相机在列之间移动；支持按流派、歌手、专辑名排列，以及真实专辑列模式。',
        files: [
          { label: 'music-model.ts', path: 'src/music-model.ts' },
          { label: 'music-array-layout.ts', path: 'src/music-array-layout.ts' },
          { label: 'music-camera.ts', path: 'src/music-camera.ts' },
          { label: 'scene.ts', path: 'src/scene.ts' },
        ],
        points: [
          '列中心距 4.746，盒体之间保留 0.75 净空；真实专辑列模式下每张专辑只出现一次。',
          '浏览只移动当前列，离开某列后会平滑归中；列内首尾会禁用箭头。',
          '相机与布局拆开，便于替换成其他排列方式或接入不同的专辑数据源。',
        ],
      },
      {
        id: 'cd-case',
        name: '玻璃专辑盒',
        group: '场景',
        summary:
          '玻璃质感的 CD 盒，包含侧条、封面贴图、内页反光与揭幕动画；封面区与昼夜几何共用。',
        files: [
          { label: 'music-cd-asset.ts', path: 'src/music-cd-asset.ts' },
          { label: 'cover-atlas.ts', path: 'src/cover-atlas.ts' },
          { label: 'glass-reveal.ts', path: 'src/glass-reveal.ts' },
          { label: 'internal-optics.ts', path: 'src/internal-optics.ts' },
        ],
        points: [
          '盒体总宽 3.996、高 3.35，侧条约 0.269；玻璃主体比正方形宽约 11.25%。',
          '封面为 2.98 × 2.98，昼夜共用同一几何；材质与灯光随主题切换。',
          '揭幕与内页光学效果独立成模块，可以单独替换动画节奏。',
        ],
      },
      {
        id: 'overview',
        name: '缩略图总览与歌手网格',
        group: '浏览',
        summary:
          '按 V 拉远镜头进入总览；横屏使用投影名牌，竖屏显示完整歌手网格，点击歌手返回近景。',
        files: [
          { label: 'music-overview.ts', path: 'src/music-overview.ts' },
          { label: 'music-overview-ui.ts', path: 'src/music-overview-ui.ts' },
          {
            label: 'music-overview-artist-grid.ts',
            path: 'src/music-overview-artist-grid.ts',
          },
        ],
        points: [
          '总览里选择不会自动播放；Esc 或 V 返回近景。',
          '宽高比 < 1.05 时自动启用完整歌手网格；也可在设置中让所有比例使用网格。',
          '投影名牌先定位列，再点箭头返回，适合大屏横屏。',
        ],
      },
      {
        id: 'settings',
        name: '双页设置面板',
        group: '面板',
        summary:
          '音乐库设置与画面声音两个页签，常用项外露、高级项折叠；页签固定在顶部，内容独立滚动。',
        files: [
          { label: 'music-panel-layout.css', path: 'src/music-panel-layout.css' },
          {
            label: 'music-settings-theme.css',
            path: 'src/music-settings-theme.css',
          },
          { label: 'quality-settings.ts', path: 'src/quality-settings.ts' },
          { label: 'audio-settings.ts', path: 'src/audio-settings.ts' },
        ],
        points: [
          '切换页签会保留已输入内容、导入预览和各页滚动位置。',
          '常用项直接展示，AI 工作流、在线资料与高级调试默认收起。',
          '浅色晨雾主题下使用不透底暖色基底，滑块、提示与滚动条统一取主题色。',
        ],
      },
      {
        id: 'player',
        name: '本地播放与切歌',
        group: '播放',
        summary:
          '读取本地音频标签与封面，通过浏览器音频或 macOS CoreAudio 输出；切歌与传输标题有独立动画。',
        files: [
          { label: 'music-player.ts', path: 'src/music-player.ts' },
          { label: 'audio.ts', path: 'src/audio.ts' },
          { label: 'music-browser-gapless.ts', path: 'src/music-browser-gapless.ts' },
          {
            label: 'music-transport-title.ts',
            path: 'src/music-transport-title.ts',
          },
        ],
        points: [
          '浏览器输出与 CoreAudio 原生输出可切换；原生输出可选择设备。',
          '浏览器端支持无缝衔接；播放状态与界面标题分离。',
          '点击右上播放歌名可定位当前曲目，但不会改变播放状态。',
        ],
      },
      {
        id: 'navigation',
        name: '滑尺与滚轮导航',
        group: '浏览',
        summary:
          '底部滑尺、滚轮、方向键与触摸共同驱动浏览；滑尺刻度与导航动画独立成模块。',
        files: [
          { label: 'music-ruler.ts', path: 'src/music-ruler.ts' },
          {
            label: 'music-wheel-navigation.ts',
            path: 'src/music-wheel-navigation.ts',
          },
          {
            label: 'music-navigation-motion.ts',
            path: 'src/music-navigation-motion.ts',
          },
        ],
        points: [
          '方向键、底部滑尺与滚轮共享同一套目标定位。',
          '列内移动与跨列移动使用不同的缓动节奏。',
          '滑尺刻度由独立 CSS 与逻辑生成，便于换主题。',
          '视觉 Demo 支持点击刻度、按住拖动、滚轮与 ← → / Home / End，指针、专辑名和计数同步更新。',
        ],
      },
      {
        id: 'theme',
        name: '主题与开场',
        group: '动效',
        summary:
          '晨雾浅色与月影深色两套主题，配合开场标语、品牌字轮与减少动态效果设置。',
        files: [
          { label: 'music-theme.css', path: 'src/music-theme.css' },
          { label: 'appearance.ts', path: 'src/appearance.ts' },
          { label: 'music-opening.ts', path: 'src/music-opening.ts' },
          { label: 'boot.ts', path: 'src/boot.ts' },
        ],
        points: [
          '开场由「ONE ALBUM AT A TIME」淡入淡出后接三维专辑阵列，可跳过、重播。',
          '手动切换主题会播放过渡动画；系统“减少动态效果”会关闭或缩短动效。',
          '主题偏好保存在浏览器，与专辑浏览位置互不影响。',
        ],
      },
      {
        id: 'lyrics',
        name: '同步歌词',
        group: '播放',
        summary:
          '读取音频文件同名的 LRC 歌词，随播放进度高亮当前行，支持偏移解析与点击歌词定位。',
        files: [
          { label: 'lyrics.ts', path: 'src/lyrics.ts' },
          { label: 'music-player.ts', path: 'src/music-player.ts' },
          { label: 'music-app.ts', path: 'src/music-app.ts' },
        ],
        points: [
          '歌词文件与音频同名放置即可被识别，不复制、不上传音频。',
          '当前行随播放进度同步高亮，点击歌词可定位播放位置。',
          '支持解析偏移标签，处理不同来源 LRC 的时间偏差。',
        ],
      },
      {
        id: 'queue',
        name: '歌单与播放队列',
        group: '播放',
        summary:
          'Windows 版新增的本机歌单管理和可编辑播放队列，支持上一首／下一首。',
        files: [
          { label: 'music-app.ts', path: 'src/music-app.ts' },
          { label: 'music-playlists.css', path: 'src/music-playlists.css' },
          { label: 'music-player.ts', path: 'src/music-player.ts' },
        ],
        points: [
          '歌单与队列保存在本机，播放仍读取原音频路径。',
          '队列可手动调整顺序，支持上一首／下一首。',
          '演示封面模式下隐藏队列编辑入口，避免误操作。',
        ],
      },
      {
        id: 'performance',
        name: '封面图集与实例化',
        group: '性能',
        summary:
          'Windows 版把封面打包为普通 2D 图集，以独立 UV 区域和实例化绘制降低三维专辑架的传输与绘制开销。',
        files: [
          { label: 'cover-atlas.ts', path: 'src/cover-atlas.ts' },
          { label: 'music-model.ts', path: 'src/music-model.ts' },
          { label: 'music-array-layout.ts', path: 'src/music-array-layout.ts' },
        ],
        points: [
          '封面更新只上传变化的图块，而不是整套图集。',
          '专辑架使用实例化绘制，减少 draw call。',
          '冷切换时选中封面与离场封面改用 CanvasTexture 路径，避免 GPU 纹理读回复制。',
        ],
      },
      {
        id: 'navhud',
        name: '底部导航与状态层',
        group: '浏览',
        summary:
          '专辑计数、上下切专辑、左右切流派、键盘提示、收藏状态与 rAF 诊断信息，是专辑架最底部的常驻界面层。',
        files: [
          { label: 'music-app.ts', path: 'src/music-app.ts' },
          { label: 'music.css', path: 'src/music.css' },
          { label: 'music-text-motion.ts', path: 'src/music-text-motion.ts' },
          { label: 'music-navigation-motion.ts', path: 'src/music-navigation-motion.ts' },
          { label: 'music-boot.ts', path: 'src/music-boot.ts' },
        ],
        points: [
          'ALBUM / SELECT 的序号会随切专辑滚动切换，总数来自当前分类。',
          '中间是专辑上下步进与刻度；右侧是流派左右切换，GENRE 计数与名称同步淡入。',
          '底部左侧显示 LOCAL COLLECTION 与演示状态，右侧是 rAF 帧率、缓冲分辨率、主题与 WebGL 2 加速状态。',
          '键盘提示常驻：← → 切流派、↑ ↓ 切专辑、ENTER 打开；开场时整组元素按序淡入。',
          '切专辑时背景专辑列整体横移、序号上滚；切流派时名称淡入、背景轻微偏色。',
          'ENTER 或点击「打开专辑」时封面放大进入详情，ESC / 返回按钮退出。',
        ],
      },
      {
        id: 'search',
        name: '音乐库与搜索',
        group: '浏览',
        summary:
          '按专辑、歌曲、流派浏览与搜索；选中结果后移动到目标位置并打开详情，不改变播放。',
        files: [
          { label: 'music-search.ts', path: 'src/music-search.ts' },
          { label: 'music-browser-gapless.ts', path: 'src/music-browser-gapless.ts' },
          { label: 'music-order.ts', path: 'src/music-order.ts' },
          { label: 'music-real-columns.ts', path: 'src/music-real-columns.ts' },
        ],
        points: [
          '搜索覆盖专辑与歌曲，可按流派过滤。',
          '定位采用缓起缓停的移动，不触发播放。',
          '每列浏览位置默认保留，切换开关不会移动当前画面。',
        ],
      },
    ],
  },
  {
    id: 'endfield-ui',
    name: 'Endfield UI',
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
          {
            label: 'SegmentedControl.tsx',
            path: 'packages/ui/src/components/segmented-control/SegmentedControl.tsx',
          },
          { label: 'Checkbox.tsx', path: 'packages/ui/src/components/checkbox/Checkbox.tsx' },
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
    name: 'Endfield Kit · 本站自研',
    tagline: '把《明日方舟：终末地》官网的字体层级、切角几何与色差字效，重写成 10 个 Vue 组件。',
    description:
      '对官网做的一次被动结构观察：DOM 形状、公开 CSS 的声明值、一次计算样式普查，再由这些数值规律重建组件。只保留结构与节奏——商业字体、美术、文案一律不复制，类名用 efk- 前缀与站内既有的 Endfield 演示区分。产物是 10 个不依赖任何 UI 框架的 Vue 组件加一套 --efk-* 令牌。',
    repo: 'https://github.com/hhdtc/cover-studio',
    release: 'https://github.com/hhdtc/cover-studio/blob/main/docs/endfield-design-system.md',
    design: 'https://github.com/hhdtc/cover-studio/blob/main/docs/endfield-design-system.md',
    demo: {
      label: '完整样式指南',
      url: '#/endfield-kit',
      note: '本站自研的完整展示页：令牌、字号阶梯、10 个组件、动效与来源说明；可一键切换「减少动效」。',
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
    tagline: '从 apple.com、iPad Pro 与 iPhone Duo 三个页面里量出字号梯级与动效节奏，重写成 8 个 Vue 组件。',
    description:
      '只看两件事：字怎么排、动怎么走。对三个公开页面做被动读取——DOM 形状、声明式 CSS 的数值、一次计算样式普查——得到一条连续的字号梯级（每级绑定字距与行高）和一套 240/320/400/500ms 的时长刻度。滚动效果由 IntersectionObserver + rAF 驱动，进度写进 CSS 变量，动画本身仍是声明式的。SF Pro 不随仓库分发，演示内容全部为占位文字。',
    repo: 'https://github.com/hhdtc/cover-studio',
    release: 'https://github.com/hhdtc/cover-studio/blob/main/docs/apple-design-system.md',
    design: 'https://github.com/hhdtc/cover-studio/blob/main/docs/apple-design-system.md',
    demo: {
      label: '排版动效展示页',
      url: '#/apple-kit',
      note: '本站自研：字号梯级、滚动位移、毛玻璃吸顶条、色带过渡与视差；可一键切换「减少动效」。',
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
        ],
        points: [
          '字体栈以 -apple-system / BlinkMacSystemFont 开头，在 macOS 上自然得到系统字体。',
          '类名前缀 apl-、变量 --apl-*，与站内既有的 ef- / efk- 组件互不干扰。',
          'prefers-reduced-motion 与 .apl-no-motion 都会把时长压到 1ms。',
        ],
      },
    ],
  },
  {
    id: 'nasa-punk',
    name: 'NASA-Punk UI Skill',
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
          { label: 'docs/ASSETS.md', path: 'docs/ASSETS.md' },
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
          { label: 'about/page.tsx', path: 'src/app/(modules)/about/page.tsx' },
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
          { label: 'blocks', path: 'apps/v4/registry/bases/radix/blocks' },
          { label: 'components.json', path: 'apps/v4/components.json' },
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
const activeModule = ref<ModuleDoc | null>(PROJECTS[0].modules[0])
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
const currentModule = computed(
  () => project.value.modules.find((m) => m.id === activeModule.value?.id) ?? null,
)
const currentShot = computed(
  () => project.value.screenshots[shotIndex.value] ?? project.value.screenshots[0],
)

function selectProject(p: Project) {
  activeProject.value = p
  activeModule.value = p.modules[0] ?? null
  shotIndex.value = 0
  demoOpen.value = false
  demoVariant.value = 'main'
  syncRoute()
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
  activeModule.value = p.modules.find((item) => item.id === parts[2]) ?? p.modules[0] ?? null
}

function syncRoute() {
  const target = `#/ui/${activeProject.value.id}/${activeModule.value?.id ?? ''}`
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
      <span class="view-sub">{{ t('收录 demo 页面与 UI 模块拆分说明', 'Project demos and UI module breakdowns') }}</span>
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
          <span class="count">{{ PROJECTS.length }}</span>
        </div>
        <div class="panel-scroll">
          <button
            v-for="p in PROJECTS"
            :key="p.id"
            class="lib-project"
            :class="{ active: p.id === project.id }"
            @click="selectProject(p)"
          >
            <span class="lib-project-name">{{ p.name }}</span>
            <span class="lib-project-meta">{{ p.stack.slice(0, 2).join(' · ') }}</span>
          </button>
          <div class="lib-future">{{ t('更多项目待收录', 'More projects coming') }}</div>

          <div class="panel-header lib-module-head">
            <h3>{{ t('模块索引', 'Modules') }}</h3>
            <span class="count">{{ project.modules.length }}</span>
          </div>
          <button
            v-for="m in project.modules"
            :key="m.id"
            class="lib-module"
            :class="{ active: currentModule?.id === m.id }"
            @click="selectModule(m)"
          >
            <span class="lib-module-dot" />
            <span class="lib-module-name">{{ m.name }}</span>
            <span class="lib-module-group">{{ m.group }}</span>
          </button>
        </div>
      </aside>

      <main class="lib-content">
        <section class="lib-hero">
          <div class="lib-hero-copy">
            <span class="lib-eyebrow">PROJECT / {{ project.id }}</span>
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

        <section class="lib-live">
          <div class="lib-live-head">
            <div>
              <span class="lib-eyebrow">DEMO</span>
              <h2>{{ project.name }} · {{ activeDemo?.label }}</h2>
              <p>{{ activeDemo?.note }}</p>
            </div>
            <div class="lib-live-actions">
              <div v-if="project.demo?.altUrl" class="lib-demo-switch">
                <button :class="{ active: demoVariant === 'main' }" @click="demoVariant = 'main'">{{ t('真实前端', 'Real app') }}</button>
                <button :class="{ active: demoVariant === 'alt' }" @click="demoVariant = 'alt'">{{ t('静态 Mock', 'Static mock') }}</button>
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
                {{ demoVariant === 'alt'
                  ? t('静态 Mock，无需 WebGL；可直接切专辑、流派和亮暗主题。', 'Static mock, no WebGL; switch albums, genres and themes directly.')
                  : t('真实前端需要本地 5175 服务；如果封面空白，可切到「静态 Mock」。', 'The real app needs the local 5175 service; if covers are blank, switch to Static mock.') }}
                <code>npm run demo:rhine</code>
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
            <h2>{{ t('本地 Demo', 'Local demo') }}</h2>
            <p>
              {{ t('这里只展示视觉部分：用 ?demo=1 启动内置封面演示，不读取音乐库、不需要音频解码。运行仍需要 Node.js 与支持 WebGL 2 的浏览器；仓库没有提供在线 Demo 地址。', 'Visual only: ?demo=1 opens the bundled covers, with no library or audio decoding. It still needs Node.js and a WebGL 2 browser; the repo has no online demo.') }}
            </p>
            <ol>
              <li>{{ t('源码已在 demos/rhine-music：执行 npm install 与 npm run build。', 'Source is in demos/rhine-music: run npm install and npm run build.') }}</li>
              <li><code>npm run music -- --port 5175</code></li>
              <li>{{ t('打开 http://127.0.0.1:5175/?demo=1，进入只含三张封面的视觉演示。', 'Open http://127.0.0.1:5175/?demo=1 for the three-cover visual demo.') }}</li>
            </ol>
            <p class="lib-note">
              {{ t('视觉演示不需要 FFmpeg；只有真实曲库播放与完整格式解码才需要它。', 'The visual demo does not need FFmpeg; only real library playback and full format decoding do.') }}
            </p>
          </div>
          <div class="lib-run-side">
            <span class="lib-eyebrow">DEMO NOTES</span>
            <strong>{{ t('纯视觉演示，不含音频', 'Visual demo, no audio') }}</strong>
            <p>{{ t('默认进入三张内置封面的演示架；不会扫描你的音乐目录。', 'Opens the three-cover demo shelf by default and never scans your music folder.') }}</p>
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

        <section class="lib-section">
          <div class="lib-section-head">
            <h2>{{ t('UI 模块拆分', 'UI modules') }}</h2>
            <p>{{ t('按功能域拆开的模块与文件，点击左侧索引或卡片查看职责与使用要点。', 'Modules and files grouped by area; pick an index or card to see its role and usage notes.') }}</p>
          </div>
          <div class="lib-grid">
            <button
              v-for="m in project.modules"
              :key="m.id"
              class="lib-card"
              :class="{ active: currentModule?.id === m.id }"
              @click="selectModule(m)"
            >
              <span class="lib-card-group">{{ m.group }}</span>
              <strong>{{ m.name }}</strong>
              <p>{{ m.summary }}</p>
              <span class="lib-card-files">{{ m.files.length }} {{ t('个模块文件', 'module files') }}</span>
            </button>
          </div>
        </section>

        <section v-if="currentModule" class="lib-detail" :data-project="project.id" :data-module="currentModule.id">
          <div class="lib-detail-head">
            <div>
              <span class="lib-eyebrow">{{ currentModule.group }} / MODULE</span>
              <h2>{{ currentModule.name }}</h2>
            </div>
            <span class="chip">{{ currentModule.files.length }} {{ t('个文件', 'files') }}</span>
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
            {{ t('说明依据仓库 README、设计文档与文件职责整理；具体 API 以项目源码为准。这里只做组件索引与使用摘记，不复制项目代码。', 'Notes are compiled from each repository’s README, design docs and file roles. The source is authoritative; this is an index and usage summary, not a copy of project code.') }}
          </p>
        </section>
      </main>
    </div>
  </div>
</template>
