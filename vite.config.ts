import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@junbyeol/tiptap-editor/style.css",
        replacement: path.resolve(__dirname, "./dist/style.css"),
      },
      {
        find: /^@junbyeol\/tiptap-editor$/,
        replacement: path.resolve(__dirname, "./dist/index.mjs"),
      },
    ],
  },
  build: {
    outDir: "dist-demo",
  },
});
