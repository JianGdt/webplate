import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(
      root,
      "." + path + (path.endsWith("/") ? "index.html" : ""),
    );
    if (!file.startsWith(root + "/")) {
      res.writeHead(403);
      res.end();
      return;
    }
    const data = await readFile(file);
    const config = await readFile("dist/_headers", "utf8");
    const blocks = config.split(/\n(?=\/)/);
    for (const block of blocks) {
      const [route, ...lines] = block.trim().split("\n");
      if (
        route === "/*" ||
        route === path ||
        (route.endsWith("/*") && path.startsWith(route.slice(0, -1)))
      ) {
        for (const line of lines) {
          const i = line.indexOf(":");
          if (i > 0) {
            const name = line.slice(0, i).trim();
            const value = line.slice(i + 1).trim();
            res.setHeader(
              name,
              name === "Content-Security-Policy" && res.hasHeader(name)
                ? res.getHeader(name) + "; " + value
                : value,
            );
          }
        }
      }
    }
    res.setHeader(
      "Content-Type",
      types[extname(file)] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4322, "127.0.0.1");
