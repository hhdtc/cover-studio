<script setup lang="ts">
import { computed, ref } from 'vue'
import { lang } from '../i18n'
import ApHeadline from '../apple-kit/ApHeadline.vue'
import ApHero from '../apple-kit/ApHero.vue'
import ApBar from '../apple-kit/ApBar.vue'
import ApPills from '../apple-kit/ApPills.vue'
import ApReveal from '../apple-kit/ApReveal.vue'
import ApBand from '../apple-kit/ApBand.vue'
import ApParallax from '../apple-kit/ApParallax.vue'
import ApCta from '../apple-kit/ApCta.vue'
import ApGlass from '../apple-kit/ApGlass.vue'
import ApLocalNav from '../apple-kit/ApLocalNav.vue'
import ApSnapGallery from '../apple-kit/ApSnapGallery.vue'
import ApStickyStory from '../apple-kit/ApStickyStory.vue'

const t = (zh: string, en: string) => (lang.value === 'zh' ? zh : en)

const barItems = [t('概览', 'Overview'), t('排版', 'Type'), t('动效', 'Motion'), t('材质', 'Material')]
const barActive = ref(barItems[1])
const barTone = ref<'light' | 'dark'>('light')
const pill = ref(0)
const pills = [t('紧凑', 'Compact'), t('常规', 'Regular'), t('宽松', 'Roomy')]
const motionOn = ref(true)

const localLinks = [t('概览', 'Overview'), t('规格', 'Specs'), t('对比', 'Compare')]
const localActive = ref(localLinks[0])
const storySteps = computed(() => [
  {
    title: t('先立材质', 'Material first'),
    body: t('玻璃三档：导航 20px 模糊、蒙层 20px、悬浮药丸 7px，透明度 0.8 / 0.4 / 0.7。', 'Three glass steps: 20px blur for nav, 20px for the scrim, 7px for a floating pill; alpha 0.8 / 0.4 / 0.7.'),
  },
  {
    title: t('再定层级', 'Then hierarchy'),
    body: t('内容列固定，文字列滚动；进入中部带的段落才点亮，其余压到 28% 不透明度。', 'The visual column pins while text scrolls; only the step inside the middle band lights up, the rest sit at 28% opacity.'),
  },
  {
    title: t('最后收束', 'Finally settle'),
    body: t('横向画廊用 scroll-snap 对齐，一次一张，不需要手势库。', 'The horizontal gallery aligns with scroll-snap, one card at a time, no gesture library.'),
  },
])

const ladder = [
  { px: 80, token: '--apl-t-80', sample: 'Display', tr: '-0.008em', lh: 1.06 },
  { px: 56, token: '--apl-t-56', sample: 'Headline', tr: '-0.005em', lh: 1.12 },
  { px: 40, token: '--apl-t-40', sample: 'Sub-headline', tr: '-0.001em', lh: 1.08 },
  { px: 28, token: '--apl-t-28', sample: 'Title', tr: '0.007em', lh: 1.14 },
  { px: 24, token: '--apl-t-24', sample: 'Title small', tr: '0.009em', lh: 1.17 },
  { px: 21, token: '--apl-t-21', sample: 'Lede', tr: '0.011em', lh: 1.38 },
  { px: 17, token: '--apl-t-17', sample: 'Body copy', tr: '-0.022em', lh: 1.47 },
  { px: 14, token: '--apl-t-14', sample: 'Control label', tr: '-0.016em', lh: 1.29 },
  { px: 12, token: '--apl-t-12', sample: 'Caption / legal', tr: '-0.01em', lh: 1.34 },
]

const aiContext = computed(() =>
  [
    'component-library: apple-kit',
    'origin: passive structural reading of apple.com, /ipad-pro/, /iphone-duo/',
    'assets: none — geometry and type ramp re-implemented; no SF Pro files, imagery or logos',
    'tokens: --apl-* (ink #1d1d1f, surface #f5f5f7, accent #0071e3)',
    'type: 12/14/17/21/24/28/40/56/80 with per-step tracking and leading ratios',
    'motion: 240/320/400/500ms; standard cubic-bezier(.4,0,.2,1), entrance (.16,1,.3,1)',
    'components: ApHeadline ApHero ApBar ApPills ApReveal ApBand ApParallax ApCta',
    'a11y: prefers-reduced-motion + .apl-no-motion kill switch; focus-visible rings',
  ].join('\n'),
)
</script>

<template>
  <div class="aplview" :class="{ 'apl-no-motion': !motionOn }">
    <ApBar :items="barItems" :active="barActive" :tone="barTone" @select="barActive = $event" />

    <ApHero>
      <p class="apl-eyebrow">{{ t('排版与动效研究', 'A TYPOGRAPHY & MOTION STUDY') }}</p>
      <h1 class="apl-display">{{ t('把间距做成节奏', 'Spacing as rhythm') }}</h1>
      <p class="apl-lede" style="text-align: center">
        {{ t('一套只讲两件事的组件：字怎么排，动怎么走。', 'A kit about two things only: how type is spaced, and how motion is paced.') }}
      </p>
      <div class="aplview-row">
        <ApCta accent>{{ t('查看尺度', 'See the scale') }}</ApCta>
        <ApCta @click="motionOn = !motionOn">{{ motionOn ? t('减少动效', 'Reduce motion') : t('恢复动效', 'Allow motion') }}</ApCta>
      </div>
    </ApHero>

    <section class="aplview-section">
      <ApHeadline :eyebrow="t('01 / 尺度', '01 / SCALE')" :title="t('一条连续的梯级', 'One continuous ladder')" :lede="t('字号不是孤立的数字，而是与字距、行高绑定的三元组。', 'A size is not a number but a triple: size, tracking, leading.')" />
      <ul class="aplview-ladder">
        <li v-for="s in ladder" :key="s.token">
          <span class="aplview-ladder__meta">{{ s.px }}px · {{ s.token }}</span>
          <span class="aplview-ladder__sample" :style="{ fontSize: s.px + 'px', letterSpacing: s.tr, lineHeight: s.lh }">{{ s.sample }}</span>
          <span class="aplview-ladder__spec">{{ s.tr }} / {{ s.lh }}</span>
        </li>
      </ul>
    </section>

    <section class="aplview-section">
      <ApHeadline :eyebrow="t('02 / 滚动', '02 / SCROLL')" :title="t('滚动驱动，而非时间驱动', 'Scroll-driven, not time-driven')" :lede="t('标题与展示区以不同振幅位移，进度写入 CSS 变量，动画本身仍由 CSS 负责。', 'Headline and stage drift at different amplitudes; progress is written into a CSS variable so the animation stays declarative.')" />
      <ApPills v-model="pill" :options="pills" />
      <div class="aplview-revealrow">
        <ApReveal v-for="i in 3" :key="i" :delay="i * 90">
          <div class="aplview-card">
            <strong>{{ ['240ms', '320ms', '500ms'][i - 1] }}</strong>
            <span>{{ t('入场延迟', 'stagger') }} {{ i * 90 }}ms</span>
          </div>
        </ApReveal>
      </div>
    </section>

    <ApBand :from="'#f5f5f7'" :to="'#1d1d1f'" dark>
      <ApHeadline :eyebrow="t('03 / 材质', '03 / MATERIAL')" :title="t('一块会换色的料', 'A material that changes')" />
      <p class="apl-caption" style="color: #a1a1a6">{{ t('滚动经过时背景以色带方式过渡，时长按观察值取 1s 线性。', 'The ground cross-fades as the band passes; 1s linear, matching the measured value.') }}</p>
    </ApBand>

    <ApParallax :items="6" :shift="70" />

    <section class="aplview-section">
      <ApHeadline :eyebrow="t('04 / 材质', '04 / MATERIAL')" :title="t('三档玻璃，一个回退', 'Three glass steps, one fallback')" :lede="t('实测值为 20px / 20px / 7px 模糊，透明度 0.8 / 0.4 / 0.7；不支持 backdrop-filter 时退回不透明底。', 'Measured blur is 20 / 20 / 7px at alpha 0.8 / 0.4 / 0.7, and the whole thing degrades to an opaque fill when backdrop-filter is unsupported.')" />
      <div class="apl-glass-demo">
        <ApGlass kind="scrim" :tint="'#1d1d1f'" style="width: min(420px, 100%)">
          <p class="apl-caption" style="color: #d2d2d7">SCRIM · blur 20px · alpha 0.4</p>
        </ApGlass>
        <ApGlass kind="nav" :tint="'#1d1d1f'" style="width: min(420px, 100%)">
          <p class="apl-caption" style="color: #d2d2d7">NAV · blur 20px · alpha 0.8</p>
        </ApGlass>
        <ApGlass kind="pill" :tint="'#424245'" style="width: min(420px, 100%)">
          <p class="apl-caption" style="color: #f5f5f7">PILL · blur 7px · alpha 0.7</p>
        </ApGlass>
      </div>
      <div class="aplview-row">
        <button class="apl-cta apl-focusable">{{ t('用 Tab 键看焦点环', 'Tab here for the focus ring') }}</button>
        <span class="apl-caption">{{ t('白色 3px 间隙 + 蓝色 5px 外环', 'white 3px gap + blue 5px ring') }}</span>
      </div>
    </section>

    <section class="aplview-section aplview-section--wide">
      <ApHeadline :eyebrow="t('05 / 叙事', '05 / STORY')" :title="t('固定一列，滚动另一列', 'Pin one column, scroll the other')" :lede="t('产品页用吸顶图形配滚动文案讲故事；画廊则用 scroll-snap 横向对齐。', 'Product pages pin the visual and scroll the copy; galleries align horizontally with scroll-snap.')" />
      <ApLocalNav :title="t('叙事示例', 'Story demo')" :links="localLinks" :active="localActive" @select="localActive = $event" />
      <ApStickyStory :steps="storySteps" />
      <ApSnapGallery :items="7" :label="t('横向画廊 · snap x mandatory', 'Horizontal gallery · snap x mandatory')" />
    </section>

    <section class="aplview-section aplview-notes">
      <ApHeadline :eyebrow="t('06 / 边界', '06 / LIMITS')" :title="t('来源与替换', 'Provenance')" />
      <ul>
        <li>{{ t('结构来自对三个公开页面的被动读取：DOM 形状、声明式 CSS 数值、计算样式普查。', 'Structure comes from a passive reading of three public pages: DOM shape, declared CSS values, computed styles.') }}</li>
        <li>{{ t('SF Pro 为苹果专有字体，不随仓库分发；这里的字体栈会回退到系统界面字体。', 'SF Pro is proprietary and is not shipped; the stack falls back to the system UI face.') }}</li>
        <li>{{ t('没有复制样式表文本、图片、商标或产品文案；演示内容为占位文字。', 'No stylesheet text, imagery, marks or product copy is reproduced; all demo copy is placeholder.') }}</li>
      </ul>
      <pre class="aplview-code">{{ aiContext }}</pre>
    </section>
  </div>
</template>

<style scoped>
.aplview {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  background: var(--apl-paper);
  color: var(--apl-ink);
  font-family: var(--apl-font);
}

.aplview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.aplview-section {
  max-width: 980px;
  margin: 0 auto;
  padding: clamp(2.5rem, 7vw, 5rem) 1.25rem;
  display: grid;
  gap: 1.5rem;
}

.aplview-ladder {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aplview-ladder li {
  display: grid;
  grid-template-columns: 9.5rem minmax(0, 1fr) 8rem;
  align-items: baseline;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--apl-line);
}

.aplview-ladder__meta,
.aplview-ladder__spec {
  font-family: var(--apl-font);
  font-size: var(--apl-t-12);
  letter-spacing: var(--apl-tr-12);
  color: var(--apl-ink-soft);
}

.aplview-ladder__spec {
  text-align: right;
}

.aplview-ladder__sample {
  font-family: var(--apl-font-display);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aplview-revealrow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.aplview-card {
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem;
  border-radius: var(--apl-radius-card);
  background: var(--apl-surface);
}

.aplview-card strong {
  font-family: var(--apl-font-display);
  font-size: var(--apl-t-24);
  font-weight: 600;
  letter-spacing: var(--apl-tr-24);
}

.aplview-card span {
  font-size: var(--apl-t-12);
  color: var(--apl-ink-soft);
}

.aplview-section--wide {
  max-width: 1120px;
}

.aplview-notes ul {
  display: grid;
  gap: 0.625rem;
  margin: 0;
  padding-left: 1.1rem;
  font-size: var(--apl-t-14);
  line-height: 1.55;
  color: var(--apl-ink-soft);
}

.aplview-code {
  margin: 0;
  padding: 1rem;
  border-radius: 12px;
  background: var(--apl-ink);
  color: #d2d2d7;
  font-family: ui-monospace, 'SFMono-Regular', monospace;
  font-size: 11px;
  line-height: 1.7;
  overflow-x: auto;
}

@media (max-width: 720px) {
  .aplview-ladder li {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .aplview-ladder__spec {
    text-align: left;
  }
}
</style>
