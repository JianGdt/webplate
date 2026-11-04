import { readFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { gzipSync } from "node:zlib";

// Count unique reachable modules per page, not the whole output directory.
// This is a build-size audit, not a substitute for browser timing measurements.
const root = resolve("dist");
for (const page of [
  "index.html",
  "templates/crm/index.html",
  "demos/cms/index.html",
]) {
  const html = await readFile(resolve(root, page), "utf8");
  const modules = new Map();
  async function visit(file) {
    if (modules.has(file)) return;
    if (relative(root, file).startsWith(".."))
      throw new Error("Module outside build output");
    const source = await readFile(file);
    modules.set(file, source);
    for (const match of source.toString().matchAll(/["'](\.\/[^"']+\.js)["']/g))
      await visit(resolve(dirname(file), match[1]));
  }
  for (const match of html.matchAll(
    /(?:component-url|renderer-url|src)="(\/_astro\/[^" ]+\.js)"/g,
  ))
    await visit(resolve(root, "." + match[1]));
  const files = [...modules.values()];
  console.log(
    JSON.stringify({
      page,
      modules: files.length,
      jsBytes: files.reduce((sum, file) => sum + file.length, 0),
      gzipBytes: files.reduce((sum, file) => sum + gzipSync(file).length, 0),
      htmlBytes: Buffer.byteLength(html),
    }),
  );
}
