<script setup lang="ts">
import { computed, ref } from 'vue'
import { lang } from '../i18n'
import EfButton from '../endfield-kit/EfButton.vue'
import EfPanel from '../endfield-kit/EfPanel.vue'
import EfSectionHead from '../endfield-kit/EfSectionHead.vue'
import EfTabBar from '../endfield-kit/EfTabBar.vue'
import EfStat from '../endfield-kit/EfStat.vue'
import EfMarquee from '../endfield-kit/EfMarquee.vue'
import EfGlitch from '../endfield-kit/EfGlitch.vue'
import EfScrollHint from '../endfield-kit/EfScrollHint.vue'
import EfTag from '../endfield-kit/EfTag.vue'
import EfRail from '../endfield-kit/EfRail.vue'

const t = (zh: string, en: string) => (lang.value === 'zh' ? zh : en)

const tab = ref(0)
const tabs = computed(() => [t('总览', 'Overview'), t('资产', 'Assets'), t('通讯', 'Comms'), t('日志', 'Logs')])
const motionOn = ref(true)
const glitchLive = ref(true)

const railItems = [
  { id: 'hero', glyph: '✦', label: t('主视觉', 'Hero') },
  { id: 'tokens', glyph: '▤', label: t('令牌', 'Tokens') },
  { id: 'components', glyph: '◈', label: t('组件', 'Components') },
  { id: 'motion', glyph: '≋', label: t('动效', 'Motion') },
  { id: 'notes', glyph: '⌗', label: t('说明', 'Notes') },
]
const railActive = ref('hero')

const palette = [
  { name: 'ink', value: '#191919', role: t('主底色', 'base ground') },
  { name: 'ink-deep', value: '#141414', role: t('面板', 'panel') },
  { name: 'paper', value: '#ffffff', role: t('文字/纸面', 'type / paper') },
  { name: 'grey-400', value: '#b3b3b3', role: t('次级文字', 'secondary') },
  { name: 'grey-600', value: '#7e7e7e', role: t('弱化文字', 'muted') },
  { name: 'accent', value: '#fffa00', role: t('信号黄', 'signal') },
  { name: 'line', value: '#5ad2ff', role: t('标注线', 'annotation') },
  { name: 'channel-r', value: '#ff2e4d', role: t('色差·红', 'aberration R') },
]

const typeScale = [
  { token: '--efk-t-30', px: 30, sample: 'SANCTUARY' },
  { token: '--efk-t-25', px: 25, sample: 'Core Chapter' },
  { token: '--efk-t-19', px: 18.75, sample: 'Section Label' },
  { token: '--efk-t-17', px: 17.5, sample: 'Body strong' },
  { token: '--efk-t-15', px: 15.6, sample: 'Body copy' },
  { token: '--efk-t-13', px: 13.75, sample: 'UI control' },
  { token: '--efk-t-12', px: 12.5, sample: 'Tab label' },
  { token: '--efk-t-11', px: 11.25, sample: 'Caption' },
  { token: '--efk-t-10', px: 10, sample: 'MICRO / 10PX' },
]

const marquee = [
  t('协议同步完成', 'protocol synced'),
  t('轨道校准 03', 'orbit calibrated 03'),
  t('信号强度 −62 dBm', 'signal −62 dBm'),
  t('档案封存', 'archive sealed'),
]

const aiContext = computed(() =>
  [
    'component-library: endfield-kit',
    'origin: structural observation of endfield.gryphline.com (public marketing site)',
    'assets: none redistributed — geometry re-drawn, copy is placeholder',
    'tokens: --efk-* (ink #191919, accent #fffa00, line #5ad2ff, channel #ff2e4d)',
    'fonts: display stack substitutes a commercial wide grotesk; no webfont files shipped',
    'components: EfButton EfPanel EfSectionHead EfTabBar EfStat EfMarquee EfGlitch EfScrollHint EfTag EfRail',
    'motion: boot strobe 1s cubic-bezier(1,0,.7,1) · roll 6s with 80% hold · tip 1.6s',
    'a11y: prefers-reduced-motion honoured · .efk-no-motion kill switch · focus-visible outlines',
  ].join('\n'),
)
</script>

<template>
  <div class="efkit" :class="{ 'efk-no-motion': !motionOn }">
    <!-- hero -->
    <section id="hero" class="efkit-hero">
      <div class="efkit-hero__body">
        <div class="efkit-hero__top">
          <span class="efk-kicker">KIT / EF-01</span>
          <EfTag accent>v0.1</EfTag>
          <EfTag live>{{ t('可运行', 'runnable') }}</EfTag>
        </div>

        <h1 class="efkit-title efk-boot">
          <EfGlitch :text="t('终末地', 'ENDFIELD')" :live="glitchLive" tag="span" />
        </h1>

        <div class="efkit-band">
          <span>{{ t('逆向组件库', 'REVERSE-ENGINEERED KIT') }}</span>
        </div>

        <p class="efkit-lead">
          {{
            t(
              '从官网的字体层级、切角几何、信号黄与色差字效中提炼的一套可复用组件。只保留结构与规律，素材与字体全部替换为自有实现。',
              'A reusable kit distilled from the site’s type ladder, notched geometry, signal yellow and chromatic type. Structure only — every asset and font is replaced with an independent implementation.',
            )
          }}
        </p>

        <div class="efkit-controls">
          <EfButton variant="primary" size="sm" @click="glitchLive = !glitchLive">
            {{ glitchLive ? t('关闭色差', 'Stop glitch') : t('开启动效', 'Run glitch') }}
          </EfButton>
          <EfButton variant="ghost" size="sm" @click="motionOn = !motionOn">
            {{ motionOn ? t('关闭动效', 'Reduce motion') : t('恢复动效', 'Allow motion') }}
          </EfButton>
          <EfScrollHint :label="t('向下', 'Scroll')" />
        </div>

        <EfMarquee :items="marquee" />
      </div>
    </section>

    <!-- tokens -->
    <section id="tokens" class="efkit-section">
      <EfSectionHead index="01" :title="t('设计令牌', 'Design tokens')" :meta="t('调色板 · 字号阶梯 · 节奏', 'palette · type ladder · rhythm')" />
      <div class="efkit-split">
        <div>
          <div class="efkit-swatches">
            <figure v-for="c in palette" :key="c.name" class="efkit-swatch">
              <span class="efkit-swatch__chip" :style="{ background: c.value }" />
              <figcaption>
                <strong>{{ c.name }}</strong>
                <span>{{ c.value }}</span>
                <small>{{ c.role }}</small>
              </figcaption>
            </figure>
          </div>
        </div>
        <EfPanel index="T" :title="t('字号阶梯', 'Type ladder')" tone="paper">
          <ul class="efkit-type">
            <li v-for="s in typeScale" :key="s.token">
              <code>{{ s.token }}</code>
              <span :style="{ fontSize: `${s.px}px`, letterSpacing: s.px > 20 ? '-0.05em' : '0' }">{{ s.sample }}</span>
              <em>{{ s.px }}px</em>
            </li>
          </ul>
        </EfPanel>
      </div>
    </section>

    <!-- components -->
    <section id="components" class="efkit-section">
      <EfSectionHead index="02" :title="t('组件', 'Components')" :meta="t('10 个可复用单元', '10 reusable units')" />
      <div class="efkit-grid">
        <EfPanel index="A" :title="t('按钮', 'Buttons')">
          <div class="efkit-row">
            <EfButton variant="primary">{{ t('下载', 'Download') }}</EfButton>
            <EfButton variant="solid">{{ t('进入', 'Enter') }}</EfButton>
            <EfButton variant="ghost">{{ t('详情', 'Details') }}</EfButton>
            <EfButton variant="danger" size="sm">{{ t('中止', 'Abort') }}</EfButton>
            <EfButton variant="ghost" size="sm" disabled>{{ t('禁用', 'Disabled') }}</EfButton>
          </div>
          <p class="efkit-note">
            {{
              t(
                '切角由 clip-path 变量控制，悬停时一道斜向扫光穿过；内描边用同形状伪元素保持边缘清晰。',
                'Notches come from a clip-path variable; hover sweeps a skewed light bar across. An inner pseudo-element keeps the edge legible.',
              )
            }}
          </p>
        </EfPanel>

        <EfPanel index="B" :title="t('楔形页签', 'Wedge tabs')">
          <EfTabBar v-model="tab" :tabs="tabs" />
          <p class="efkit-note">
            {{
              t(
                '右缘切 55° 的箭头形，选中态反转为黑底信号黄字。',
                'Right edge cut at 55° into an arrow; the selected state inverts to ink with signal-yellow label.',
              )
            }}
          </p>
        </EfPanel>

        <EfPanel index="C" :title="t('数据行', 'Stat rows')">
          <EfStat :label="t('同步率', 'Sync')" value="98.2" unit="%" :ratio="0.982" />
          <EfStat :label="t('信号', 'Signal')" value="−62" unit="dBm" :ratio="0.38" />
          <EfStat :label="t('库存', 'Stock')" value="1 204" :ratio="0.64" />
        </EfPanel>

        <EfPanel index="D" :title="t('色差标题', 'Chromatic headline')">
          <p class="efkit-demo-title">
            <EfGlitch text="OVER THE FRONTIER" :live="glitchLive" />
          </p>
          <p class="efkit-note">
            {{
              t(
                '两层通道副本以 screen 混合错位抖动，仅在悬停或 live 时可见——避免整页常驻动画。',
                'Two channel copies jitter with screen blending, visible only on hover or when live — avoids a permanently animating page.',
              )
            }}
          </p>
        </EfPanel>

        <EfPanel index="E" :title="t('标签', 'Tags')">
          <div class="efkit-row">
            <EfTag accent>NEW</EfTag>
            <EfTag live>LIVE</EfTag>
            <EfTag>{{ t('已归档', 'archived') }}</EfTag>
          </div>
        </EfPanel>

        <EfPanel index="F" :title="t('面板', 'Panel')" :scan="true">
          <p class="efkit-note">
            {{ t('四角刻度 + 可选扫描线叠层，用于承载任意内容。', 'Corner ticks plus an optional scanline overlay; carries arbitrary content.') }}
          </p>
          <div class="efkit-row">
            <EfButton variant="primary" size="sm">{{ t('确认', 'Confirm') }}</EfButton>
            <EfButton variant="ghost" size="sm">{{ t('取消', 'Cancel') }}</EfButton>
          </div>
        </EfPanel>

        <EfPanel index="G" :title="t('图标导轨', 'Icon rail')">
          <div class="efkit-rail-demo">
            <EfRail v-model="railActive" :items="railItems" />
          </div>
          <p class="efkit-note">
            {{ t('左侧竖向导航：选中项反色并带左侧信号黄刻度。', 'Vertical navigation: the active item inverts and gains a signal-yellow tick.') }}
          </p>
        </EfPanel>
      </div>
    </section>

    <!-- motion -->
    <section id="motion" class="efkit-section">
      <EfSectionHead index="03" :title="t('动效', 'Motion')" :meta="t('时长 · 缓动 · 循环', 'duration · easing · loop')" />
      <div class="efkit-grid">
        <EfPanel index="01" :title="t('启动频闪', 'Boot strobe')">
          <div class="efkit-motion-box efk-boot">{{ t('1s · 四次衰减', '1s · four decays') }}</div>
        </EfPanel>
        <EfPanel index="02" :title="t('滚动轮播', 'Rolling content')">
          <EfMarquee :items="marquee" />
          <p class="efkit-note">{{ t('6s 线性，80% 处停住再回卷。', '6s linear, holds at 80% before wrapping.') }}</p>
        </EfPanel>
        <EfPanel index="03" :title="t('滚动提示', 'Scroll hint')">
          <EfScrollHint :label="t('继续向下', 'Keep scrolling')" />
        </EfPanel>
      </div>
    </section>

    <!-- notes -->
    <section id="notes" class="efkit-section">
      <EfSectionHead index="04" :title="t('说明与边界', 'Notes & limits')" :meta="t('来源 · 替换 · 许可', 'origin · substitution · licence')" />
      <EfPanel index="i" :title="t('来源', 'Provenance')" tone="paper">
        <ul class="efkit-list">
          <li>
            {{
              t(
                '结构来自对公开官网的一次静态观察：DOM 结构、声明式 CSS 与计算样式。未执行任何注入，未抓取私有接口。',
                'Structure comes from one passive observation of the public site: DOM shape, declared CSS and computed styles. No injection, no private endpoints.',
              )
            }}
          </li>
          <li>
            {{
              t(
                '原站使用商业字体（宽体无衬线显示体与几何无衬线 UI 体）。本库不附带字体文件，仅提供可替换的字体栈。',
                'The original uses commercial faces (a wide grotesk for display, a geometric sans for UI). This kit ships no font files, only a substitutable stack.',
              )
            }}
          </li>
          <li>
            {{
              t(
                '配色、尺寸、圆角、切角角度与动效时长都按观察值重新表达，未复制其样式表文本。',
                'Colour, size, notch angle and motion durations are re-expressed from observed values; no stylesheet text was copied.',
              )
            }}
          </li>
        </ul>
      </EfPanel>
      <EfPanel index="ii" :title="t('接入', 'Wiring')">
        <pre class="efkit-code">import { EfButton, EfPanel } from './endfield-kit'
// tokens: src/endfield-kit/tokens.css
// styles: src/endfield-kit/kit.css</pre>
      </EfPanel>
      <EfPanel index="iii" :title="t('机器可读上下文', 'AI context')">
        <pre class="efkit-code">{{ aiContext }}</pre>
      </EfPanel>
    </section>
  </div>
</template>

<style scoped>
.efkit {
  --efkit-pad: clamp(1rem, 3vw, 2.5rem);
  flex: 1 1 auto;
  width: 100%;
  max-width: 1180px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  margin: 0 auto;
  padding: 0 0 6rem;
  background: #f4f4f4;
  color: var(--efk-ink);
  font-family: var(--efk-font-ui);
}

.efkit-section,
.efkit-hero {
  padding-inline: var(--efkit-pad);
}

.efkit-hero {
  display: block;
  margin-bottom: 1rem;
  padding-block: 2rem 2.5rem;
  background: var(--efk-ink);
  color: var(--efk-paper);
}

.efkit-rail-demo {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.efkit-rail-demo :deep(.efk-rail) {
  background: transparent;
  border-right: 0;
}
.efkit-rail-demo :deep(.efk-rail__item) {
  color: var(--efk-grey-400);
}
.efkit-rail-demo :deep(.efk-rail__item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--efk-paper);
}

.efkit-hero__body {
  min-width: 0;
}

.efkit-hero__top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.efkit-title {
  margin: 0;
  font-family: var(--efk-font-display);
  font-size: clamp(3rem, 11vw, 7rem);
  font-weight: 900;
  line-height: 0.82;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}

.efkit-band {
  display: inline-block;
  margin: 1rem 0 0.75rem;
  padding: 0.375rem 1.25rem;
  background: var(--efk-accent);
  color: var(--efk-ink);
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-11);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  /* Angled ends: the site's title band motif. */
  clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 14px 100%);
}

.efkit-lead {
  max-width: 58ch;
  margin: 0 0 1.25rem;
  font-size: var(--efk-t-15);
  line-height: 1.6;
  color: var(--efk-grey-400);
}

.efkit-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.efkit-section {
  padding-block: 3rem 1rem;
  border-bottom: 1px solid rgba(25, 25, 25, 0.1);
}

.efkit-inner {
  max-width: 1180px;
  margin: 0 auto;
}

.efkit-split {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 1.5rem;
}

.efkit-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.efkit-swatch {
  margin: 0;
  border: 1px solid rgba(25, 25, 25, 0.14);
  background: var(--efk-paper);
}

.efkit-swatch__chip {
  display: block;
  height: 56px;
  border-bottom: 1px solid rgba(25, 25, 25, 0.14);
}

.efkit-swatch figcaption {
  display: grid;
  gap: 0.125rem;
  padding: 0.5rem 0.625rem;
  font-size: var(--efk-t-11);
}

.efkit-swatch figcaption strong {
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-10);
  letter-spacing: var(--efk-track-mono);
  text-transform: uppercase;
}

.efkit-swatch figcaption span {
  font-family: var(--efk-font-mono);
  color: var(--efk-grey-700);
}

.efkit-swatch figcaption small {
  color: var(--efk-grey-600);
}

.efkit-type {
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.efkit-type li {
  display: grid;
  grid-template-columns: 7rem 1fr auto;
  align-items: baseline;
  gap: 0.75rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid rgba(127, 127, 127, 0.18);
}

.efkit-type code {
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-10);
  color: var(--efk-grey-600);
}

.efkit-type em {
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-10);
  font-style: normal;
  color: var(--efk-grey-600);
}

.efkit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.efkit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.efkit-note {
  margin: 0.75rem 0 0;
  font-size: var(--efk-t-11);
  line-height: 1.6;
  color: var(--efk-grey-600);
}

.efkit-demo-title {
  margin: 0;
  font-family: var(--efk-font-display);
  font-size: clamp(1.25rem, 3.2vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--efk-paper);
}

.efkit-motion-box {
  padding: 1.25rem;
  background: var(--efk-ink);
  color: var(--efk-accent);
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-11);
  letter-spacing: var(--efk-track-mono);
  text-transform: uppercase;
  text-align: center;
}

.efkit-list {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.625rem;
  font-size: var(--efk-t-12);
  line-height: 1.65;
  color: var(--efk-grey-800);
}

.efkit-code {
  margin: 0;
  padding: 0.875rem;
  overflow-x: auto;
  background: var(--efk-ink);
  color: var(--efk-grey-200);
  font-family: var(--efk-font-mono);
  font-size: var(--efk-t-10);
  line-height: 1.7;
}

@media (max-width: 820px) {
  .efkit-hero {
    grid-template-columns: 1fr;
  }
  .efkit-hero__rail {
    display: none;
  }
  .efkit-split {
    grid-template-columns: 1fr;
  }
}
</style>
