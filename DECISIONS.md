# Implementation decisions

- Retain the existing Astro 7, React and Tailwind 4 stack. React is the only island framework. Retaining the installed integration avoids a migration; all islands use visible hydration except the immediately useful gallery filter, which uses idle.
- Ship the six required templates; stretch templates are deferred. Each demo is a complete single-page experience with anchor-linked sections. Metadata `pages` describes those included sections, and the design specification labels these as pages.
- “Use this template” opens the customization details and full-demo link. There is no hosted download, purchase flow, or external service in v1.
- Demos live under noindex `/demos/` routes inside same-origin iframes for real responsive viewport behavior. Only these routes permit same-origin framing; the Hub denies embedding.
- Astro generates script CSP hashes. A postbuild step collects those hashes into host headers, with no unsafe-inline script exemption. Style attributes are permitted for validated theme palettes.
- Canonical URLs default to the reserved example domain until PUBLIC_SITE_URL is configured by the deployer. No hosting destination was provided.
- Demo forms validate in the browser and never transmit or persist personal data. There is no server endpoint to validate.
- All photos are downloaded Unsplash assets served locally and optimized by Astro. The graphic portfolio and SaaS previews use native HTML and CSS.
- New runtime dependencies: clsx and tailwind-merge implement the requested utility helper; sitemap generates search metadata. Development dependencies implement the specifically requested linting, formatting, testing, and commit checks. Install scripts are not broadly approved.
- TypeScript 5.9 is pinned for compatibility with the lint tooling. Existing unrelated starter packages are retained to avoid unrequested dependency removals.

- Apply DESIGN.md Gallery and Workbench layouts; retain static server-rendered cards, so there is no asynchronous card-loading state needing skeletons. Show curated order because no usage analytics exist.
- Self-host the six requested font families via Fontsource. Workbench islands use idle hydration so the shared device controls and preview activate together.
- EDITOR-AND-EXPORT.md is absent; inline editing and HTML export are not introduced by this design update.
- Correct the unavailable deepmerge override to 4.3.1 and use Astro’s scoped styleDirective API for palette style attributes. Script CSP remains hash-based.

- Add three requested business system demos under a Systems category. Each owns its Zustand store and Zod schemas; shared dashboard UI is presentational. CRM contact details are not persisted. CMS audience history is explicitly sample data; status, pipeline, and inventory charts derive from current session records.
- Use the existing GSAP dependency for a single coordinated dashboard reveal, scoped with context and matchMedia cleanup. Charts expose values as keyboard-accessible controls and SVG text alternatives.

- Scope a minimatch 3.1.5 override to eslint-plugin-jsx-a11y because the global minimatch 11 override changes its expected API and crashes label validation.

- Each system demo has its own brand and section navigation. Switching between templates stays in the outer Hub; dashboard sidebars do not link to other system demos.

- Position the hub as Webplate's freelance portfolio, using the owner-provided email jgodito27@gmail.com. Do not invent a personal name, credentials, testimonials, prices, or delivery promises.
- Project inquiries prepare a reviewable mailto draft, with a copy fallback for freelance-platform conversations. No backend submission or persistence is implied; the client explicitly sends from their email app. Mark sample projects and frontend dashboards clearly, with production features scoped separately.

- The owner requested Geist only. All typography roles, dashboard styles, and demo headings use the self-hosted Geist variable font; metadata lists Geist for both heading and body fonts. This supersedes the original multi-font design specification.

- Add GSAP section reveals with IntersectionObserver, short gallery filter staggers, and cancellable device-width animation. Keep content visible before JavaScript, respect live reduced-motion changes, clean up animations and observers, and retain native scrolling with optional CSS smooth anchor navigation.

- Upgrade the existing CMS, CRM, and inventory templates to shared shadcn Base UI components and Recharts; add Care Desk as a separate healthcare dashboard, retaining the public clinic site. Replace dashboard layout CSS with Tailwind utilities and keep only scoped theme variables.
- Build an original GSAP/SVG gooey indicator inspired by the user’s GSAP Vault reference, without importing its paid source. Use leading and trailing blobs, hover response, keyboard navigation, resize cleanup, and a reduced-motion fallback.

The collection sidebar, gallery categories, preview device switch, dashboard sections, and demo filter/menu/pricing controls share `LiquidSurface`. It uses GSAP-driven leading and trailing shapes plus an SVG alpha filter, inspired by the public GSAP Vault gooey-navigation reference. Labels and focus outlines remain unfiltered. Collection links retain native URLs, modifier-click behavior, and a no-JavaScript fallback; ordinary navigation follows a 480ms highlight transition. Reduced-motion navigation is immediate.

Motion expansion: liquid indicators now squash and stretch along their travel direction, with staggered trailing shapes. Page entrances use staggered timelines, gallery previews and project links lift with spring settling, dashboard panels reveal in sequence, charts wipe in on data changes, and device previews ease between widths. GSAP matchMedia scopes every enhancement; changing to reduced motion reverts transforms and clipping. Content remains visible without JavaScript, and scroll position stays browser-controlled.

Performance and flicker pass: retain Astro's static MPA architecture and opt into native cross-document view transitions (ordinary navigation remains the fallback). Keep outgoing pages opaque while the new snapshot appears. Liquid indicators use layout effects to avoid post-paint jumps. Existing dashboard panels no longer replay entrances on section changes, and data refreshes never hide charts behind a clipping animation. Small gallery/device allowlists avoid shipping Zod to those pages; form and content schemas still use Zod. Sidebar islands receive only rendered navigation fields. Hero images ship responsive WebP sizes, below-fold islands hydrate within 200px of visibility, the primary Geist font is preloaded, and hashed assets receive immutable caching. Unused font packages were removed and build-time tooling moved to devDependencies. `node scripts/bundle-report.mjs` reports reachable client module sizes per representative page.
