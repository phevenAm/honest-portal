import {
  defineConfig
} from "vite";
import react from "@vitejs/plugin-react";
import {
  fileURLToPath,
  URL
} from 'url'
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@models': fileURLToPath(new URL('./src/models', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    }
  },

  css: {
    devSourcemap: true,
  },
  server: {
    historyApiFallback: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "src/test/setupTests.js",
    coverage: {
      provider: "istanbul",
    },
  },
});