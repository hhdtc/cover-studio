import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves this repo from /cover-studio/, so the Pages build sets
// PAGES=1 and everything (assets, icons, public files) moves under that base.
// Local dev and the Docker image keep the root base.
const pagesBase = process.env.PAGES === '1' ? '/cover-studio/' : '/'

export default defineConfig({
  base: pagesBase,
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
