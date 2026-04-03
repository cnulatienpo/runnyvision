import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readdirSync } from "fs";

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

export default defineConfig({
  plugins: [pngListPlugin(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
