import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      outDir: "dist/types",
      include: ["src/lib", "src/tiptap", "src/components", "src/hooks"],
      exclude: ["src/App.tsx", "src/main.tsx"],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "TiptapEditor",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: (id) => {
        const packages = [
          "react",
          "react-dom",
          "@tiptap/core",
          "@tiptap/pm",
          "@tiptap/react",
        ];
        const prefixes = [
          "react/",
          "react-dom/",
          "@tiptap/core/",
          "@tiptap/pm/",
          "@tiptap/react/",
          "prosemirror-",
        ];
        return packages.includes(id) || prefixes.some((p) => id.startsWith(p));
      },
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
          "@tiptap/core": "TiptapCore",
          "@tiptap/pm": "TiptapPm",
          "@tiptap/react": "TiptapReact",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes("tiptap-editor.css"))
            return "style.css";
          return assetInfo.names?.[0] ?? "asset.[ext]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    // 소비자가 dist/style.css를 직접 import 할 수 있도록 CSS를 하나로 묶음
    cssCodeSplit: false,
    sourcemap: true,
  },
});
