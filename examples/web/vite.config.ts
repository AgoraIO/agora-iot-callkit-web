import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export const BASE_URL_HEAD = "http://api.sd-rtn.com/";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["agora-rtc-sdk-ng"],
  },
  base: "./",
  plugins: [
    // https://uno.antfu.me/
    react(),
  ],
  server: {
    proxy: {
      "^/(.*?)(cn|na|ap|eu)(/.*)$": {
        target: BASE_URL_HEAD,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/stream-manager/, ""),
      },
    },
  },
});
