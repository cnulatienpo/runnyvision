import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readdirSync } from "fs";
import { componentTagger } from "lovable-tagger";

function pngListPlugin() {
  const virtualId = 'virtual:png-list';
  const resolvedId = '\0' + virtualId;
  return {
    name: 'png-list',
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id === resolvedId) {
        const dir = path.resolve(__dirname, 'public/pngs');
        const files = readdirSync(dir)
          .filter((f: string) => f.toLowerCase().endsWith('.png'))
          .sort()
          .map((f: string) => `/pngs/${f}`);
        return `export default ${JSON.stringify(files)};`;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [pngListPlugin(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
