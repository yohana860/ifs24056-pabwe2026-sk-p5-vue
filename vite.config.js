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