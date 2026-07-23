import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic imports — vite is a devDependency, only available in development
  const viteModule = await import("vite");
  const createViteServer = viteModule.createServer;
  const viteLogger = viteModule.createLogger();
  // @ts-ignore - vite.config is only available in dev
  const viteConfig = (await import("../vite.config.js")).default;
  const { nanoid } = await import("nanoid");

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // When running from dist/server/, public files are at dist/public/ (sibling directory)
  // When running from server/, public files are at dist/public/ (from project root)
  let distPath = path.resolve(import.meta.dirname, "..", "public");
  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve memorial-specific meta tags for barima subdomain
  const indexPath = path.resolve(distPath, "index.html");
  app.use((req, res, next) => {
    const host = req.hostname || "";
    if (!host.startsWith("barima.")) return next();

    // Let API and asset requests pass through
    if (req.path.startsWith("/api/") || req.path.startsWith("/assets/")) return next();

    let html = fs.readFileSync(indexPath, "utf-8");
    html = html
      .replace(
        /<title>[^<]*<\/title>/,
        "<title>Barima River Memorial | In Loving Memory</title>"
      )
      .replace(
        /<meta name="description"[^>]*>/,
        '<meta name="description" content="A memorial tribute to those lost in the Barima River Boat Tragedy, July 17, 2026. Region 1, Barima-Waini, Guyana. Rest in peace.">'
      )
      .replace(
        /<meta property="og:title"[^>]*>/,
        '<meta property="og:title" content="Barima River Memorial — In Loving Memory">'
      )
      .replace(
        /<meta property="og:description"[^>]*>/,
        '<meta property="og:description" content="A memorial tribute to those lost in the Barima River Boat Tragedy. They were loved. They are remembered. They will never be forgotten.">'
      )
      .replace(
        /<meta property="og:url"[^>]*>/,
        '<meta property="og:url" content="https://barima.reimagine-guyana.com">'
      )
      .replace(
        /<meta property="og:site_name"[^>]*>/,
        '<meta property="og:site_name" content="Barima River Memorial">'
      )
      .replace(
        "</head>",
        '  <meta property="og:image" content="https://barima.reimagine-guyana.com/assets/coat-of-arms-CuozGH1x.png">\n' +
        '  <meta property="og:image:width" content="400">\n' +
        '  <meta property="og:image:height" content="400">\n' +
        '  <meta name="twitter:card" content="summary">\n' +
        '  <meta name="twitter:title" content="Barima River Memorial — In Loving Memory">\n' +
        '  <meta name="twitter:description" content="A memorial tribute to those lost in the Barima River Boat Tragedy, July 17, 2026.">\n' +
        "  </head>"
      );
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}
