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
    include: ['tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    deps: {
      optimizer: {
        web: {
          include: [/msw/]
        }
      }
    },
    coverage: {
      exclude: [
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.js',
        'src/main.jsx',
        'src/utils/fonts.js',
        'src/utils/themes.js',
        'src/utils/chainIcon.js',
        'src/utils/find-language.js',
        'src/mocks/setup.js',
        'src/redux/store.js',
        'src/services/axiosConfig.js',
        'eslint.config.js',
        'src/App.jsx',
        'src/hooks/useDebounce.jsx',
        'src/hooks/useVersion.jsx',
        'src/components/ScrollToTop.jsx',
        'src/index.css',
        'src/components/PrivateRoute.jsx',
        'src/pages/OAuthCallback.jsx',
        'src/services/version.js',
        'src/services/encryption.js',
        'src/services/auth.js',
        'src/services/note.js',
        'src/services/image.js',
        'src/components/Editor/ImageUploader.jsx',
      ],
      reporter: ['cobertura', 'html', 'text'],
      reportsDirectory: './coverage'
    }
  }
})
