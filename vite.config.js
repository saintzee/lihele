import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
