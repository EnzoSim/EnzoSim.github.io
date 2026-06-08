import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/washington-dc/",
  plugins: [react()],
  build: {
    outDir: "../washington-dc",
    emptyOutDir: false,
    assetsDir: "assets/app",
    rollupOptions: {
      output: {
        entryFileNames: "assets/app/[name]-[hash].js",
        chunkFileNames: "assets/app/[name]-[hash].js",
        assetFileNames: "assets/app/[name]-[hash][extname]"
      }
    }
  }
});
