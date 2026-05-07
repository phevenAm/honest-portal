import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

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
