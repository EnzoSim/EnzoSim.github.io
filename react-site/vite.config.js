import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../',
    emptyOutDir: false,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        projects: path.resolve(__dirname, 'projects/index.html'),
        work: path.resolve(__dirname, 'work/index.html'),
        reading: path.resolve(__dirname, 'reading/index.html'),
        fdaCatalyst: path.resolve(__dirname, 'fda-catalyst.html'),
      },
    },
  },
})
