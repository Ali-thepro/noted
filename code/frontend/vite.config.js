import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      include: [
        /markmarkdown-it-plantuml/,
        /markdown-it-abbr/,
        /@mdit\/plugin-spoiler/
      ]
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codemirror/lang-')) {
            return `codemirror-${id.split('/').pop()}`
          }
          if (id.includes('@codemirror/')) {
            return 'codemirror-core'
          }
        }
      },
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js', 
  }
})
