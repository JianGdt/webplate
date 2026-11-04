# Template Hub

Ten responsive, interactive templates in a static Astro gallery: Kiln & Co., Field Notes, Mendoza Clinic, Sinag Kitchen, Mara Reyes, Tally, Content Studio (CMS), Relationships (CRM), and Stockroom (inventory), and Care Desk (healthcare dashboard).

## Development

Use the Node version in `.nvmrc`, then `pnpm install` and `pnpm exec husky` to install the commit hook. Run `pnpm astro dev --background`; manage it with `pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop`.

## Checks

- `pnpm lint` — ESLint, TypeScript, Astro and JSX accessibility rules.
- `pnpm format:check` / `pnpm format` — check or apply Prettier.
- `pnpm astro check` — strict type and component checks.
- `pnpm test` — unit tests for URLs, schemas, formatters and cart behavior.
- `pnpm build` — validate content, build static pages and generate CSP headers.
- `pnpm exec playwright install chromium` then `pnpm test:e2e` — production browser tests. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing browser.
- `pnpm audit` — dependency audit, also required in CI.

## Deployment

Set `PUBLIC_SITE_URL` to your public HTTPS origin before building. The default example domain is for local development only. Deploy `dist/` to a host supporting Netlify/Cloudflare `_headers`; other hosts must translate that file to equivalent response headers. `node scripts/serve.mjs` serves the production build and its security headers at port 4322 for testing. Astro's dev server is not a production security-header test.

Forms are demos: no submitted information is sent, logged or persisted. Cart items and device choice are the only persisted state. There are no accounts, payments, cookies or tracking services.

## Structure

`src/content/templates` contains validated metadata; `src/templates/<slug>` owns each demo; `src/components/gallery` renders cards, filters and the preview; `src/components/layout` owns shared chrome; `src/components/ui` contains domain-independent controls. Shared schemas and helpers are in `src/lib`, and individual Zustand stores are in `src/stores`.

## Add a template

1. Add `src/content/templates/<slug>.json` matching `TemplateSchema` in `src/lib/schemas/template.ts`. Invalid entries fail the build.
2. Create `src/templates/<slug>/Demo.astro`, its components and data. Set the scoped palette via metadata; do not import from another template.
3. Register the demo in the component map in `src/pages/demos/[slug].astro`, and add a miniature preview in `MiniPreview.astro`. Detail routes are generated automatically.
4. Put shared form validation in `src/lib/schemas` and derive types from Zod. Keep personal data out of storage.
5. Add a Playwright smoke test, check contrast, keyboard behavior, reduced motion, and widths from 360px.

See `DECISIONS.md` for architecture choices and `VERIFICATION.md` for measured results and limitations. Use Conventional Commits when committing changes.

### Business dashboard demos

- CMS: create/edit articles, publish drafts, search content, and switch sample traffic periods.
- CRM: add contacts and opportunities, move deals between stages, and inspect live pipeline totals.
- Inventory: add unique SKUs, receive/dispatch units, filter low stock, and inspect movement history.
- Open these from the Systems gallery category or `/demos/cms/`, `/demos/crm/`, and `/demos/inventory/`. Data stays in session memory and resets on reload; these templates do not include authentication or a backend.
- GSAP animates dashboard entry and view changes. Animations clean up on unmount and are disabled for reduced motion.

### Freelance portfolio and project inquiries

Webplate's homepage introduces services, interactive demo projects, and the project process. `/contact/` prepares a validated project brief and opens the visitor's email app addressed to `jgodito27@gmail.com`; it does not send or store submissions. Clients can also copy the brief to their freelance platform conversation. Template inquiry links preselect the relevant demo. Brand and contact details live in `src/lib/portfolio.ts`.

Dashboard interfaces use shadcn Base UI components, Tailwind utilities, and Recharts through the shadcn Chart container. The chart wrapper uses scoped CSS variables instead of injected style HTML to preserve the CSP. Care Desk provides fictional appointments, scheduling validation, status changes, and operational charts at `/demos/healthcare-dashboard/`. Gooey navigation is a custom GSAP/SVG-filter effect inspired by the supplied GSAP Vault reference; reduced motion snaps directly to the selected item.

Performance checks: run `pnpm build` followed by `pnpm analyze:bundles` to report the unique JavaScript modules reachable by the gallery, preview, and CMS pages. These are raw/gzip build sizes, not network timings. The optimization pass reduced gallery JavaScript from 414,513 to about 330,000 bytes and preview JavaScript from 418,508 to about 335,000 bytes by keeping the full validation library out of simple navigation controls. Dashboards retain the shadcn/Recharts feature set.

The site stays statically rendered with selectively hydrated islands. Responsive hero images, primary-font preloading, hover prefetching, and immutable caching for hashed assets improve loading. Native cross-document transitions preserve the previous page while the next one arrives; unsupported browsers use normal navigation. Existing dashboard panels stay visible when switching sections. Reduced-motion settings disable movement, and preview controls also work without browser storage.
