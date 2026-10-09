import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Inline CSS hasil build ke index.html supaya tidak ada stylesheet yang render-blocking
function inlineCssPlugin() {
  return {
    name: "inline-css-into-html",
    apply: "build",
    enforce: "post",
    generateBundle: {
      order: "post",
      handler(_, bundle) {
        const htmlFile = Object.values(bundle).find((f) => f.fileName === "index.html");
        if (!htmlFile) return;
        let html = String(htmlFile.source);
        for (const [name, file] of Object.entries(bundle)) {
          if (file.type !== "asset" || !name.endsWith(".css")) continue;
          const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const re = new RegExp(`<link[^>]*href="[^"]*${escaped}"[^>]*>`);
          if (re.test(html)) {
            html = html.replace(re, () => `<style>${file.source}</style>`);
            delete bundle[name];
          }
        }
        htmlFile.source = html;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT) || 3000;
  return {
    plugins: [vue(), tailwindcss(), inlineCssPlugin()],
    server: { port },
    preview: { port },
    define: {
      DELCOM_BASEURL: JSON.stringify(env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: ["src/main.js", "src/setupTests.js", "src/test-utils.js", "**/*.test.js", "node_modules/**"],
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  };
});