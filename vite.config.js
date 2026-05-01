import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
   css: {
    devSourcemap: true,  // ← shows which .scss file a style comes from in DevTools
  },
    server: {
    historyApiFallback: true,
  }
})
