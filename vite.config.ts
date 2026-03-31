import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/pretext-examples/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        '01-basic-height': resolve(__dirname, 'src/01-basic-height.html'),
        '02-resize': resolve(__dirname, 'src/02-resize.html'),
        '03-layout-with-lines': resolve(__dirname, 'src/03-layout-with-lines.html'),
        '04-shrinkwrap': resolve(__dirname, 'src/04-shrinkwrap.html'),
        '05-text-wrap-around-image': resolve(__dirname, 'src/05-text-wrap-around-image.html'),
        '06-pre-wrap': resolve(__dirname, 'src/06-pre-wrap.html'),
        '07-locale-and-cache': resolve(__dirname, 'src/07-locale-and-cache.html'),
        '08-font-format': resolve(__dirname, 'src/08-font-format.html'),
        '09-circle-text': resolve(__dirname, 'src/09-circle-text.html'),
        '10-text-shape': resolve(__dirname, 'src/10-text-shape.html'),
      },
    },
  },
})
