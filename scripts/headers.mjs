import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const hashes = new Set();
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) await walk(file);
    else if (file.endsWith(".html")) {
      const html = await readFile(file, "utf8");
      const csp = html.match(
        /http-equiv="content-security-policy" content="([^"]+)"/i,
      )?.[1];
      if (!csp) throw new Error(`Missing Astro CSP: ${file}`);
      for (const hash of csp.matchAll(/'sha256-[^']+'/g)) hashes.add(hash[0]);
    }
  }
}
await walk("dist");
const policy = `default-src 'self'; script-src 'self' ${[...hashes].join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'`;
const common = `  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\n  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n  Cross-Origin-Opener-Policy: same-origin\n`;
// Non-overlapping rules prevent hosts from combining contradictory framing policies.
let headers = `/*\n${common}  Content-Security-Policy: ${policy}\n/\n  Content-Security-Policy: frame-ancestors 'none'\n/templates/*\n  Content-Security-Policy: frame-ancestors 'none'\n/404.html\n  Content-Security-Policy: frame-ancestors 'none'\n/demos/*\n  Content-Security-Policy: frame-ancestors 'self'\n`;
headers += "/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n";
await writeFile("dist/_headers", headers);
console.log(`Generated security headers with ${hashes.size} build hashes.`);
