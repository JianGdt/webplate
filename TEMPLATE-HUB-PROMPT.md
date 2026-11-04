# Template Hub: Build Prompt

You are a senior frontend engineer. Build **Template Hub**, one website that contains many complete website templates (ecommerce, blog, healthcare, restaurant, portfolio, SaaS landing, and more). Visitors browse a gallery, open a template, and click around a working demo of it.

Read this whole document before writing code. Follow it exactly. When something is unclear, choose the simplest option that satisfies the rules below and write the decision in `DECISIONS.md`.

---

## 1. Stack (fixed, do not substitute)

| Concern | Tool |
| --- | --- |
| Framework | Astro (latest stable, static output by default) |
| Interactivity | Astro islands (`client:visible` / `client:idle`), using the framework integration you pick in section 3 |
| Styling | Tailwind CSS (v4 via `@tailwindcss/vite`, or v3 if the project already uses it) |
| Validation | Zod |
| Client state | Zustand |
| Language | TypeScript, `strict: true` |

Package manager: `pnpm`. Commit the lockfile. Pin Node with `.nvmrc`.

---

## 2. Product requirements

1. **Gallery page** (`/`): grid of template cards with a mini preview, name, description, tags, page count. Category filter (All, Commerce, Content, Services, Creative). The active filter is reflected in the URL (`/?category=services`) so it can be shared.
2. **Template page** (`/templates/[slug]`): a live demo of the template inside a browser-style frame, with a device switch (Desktop, Tablet, Phone), a details panel (pages included, color palette, fonts), and a "Use this template" button.
3. **Templates to ship first (6):** ecommerce, blog, healthcare, restaurant, portfolio, SaaS landing. Add real estate, online course and event page as stretch.
4. **Each template has working interactions:**
   - Ecommerce: category filter, add to cart, cart count.
   - Blog: topic filter, newsletter form with validation.
   - Healthcare: pick a day and time, confirm slot, validated contact form.
   - Restaurant: menu tabs.
   - Portfolio: project filter.
   - SaaS: monthly/yearly pricing toggle.
5. **Responsive** from 360px up. No horizontal page scroll.
6. **Accessible** (see section 9).
7. Use realistic content (Filipino names, peso prices, local places are fine). No lorem ipsum.

Out of scope for v1: user accounts, a real checkout, a CMS, a database.

---

## 3. Architecture

### 3.1 Rendering strategy
- Default to **static** output. Astro components (`.astro`) render all content that does not need JavaScript.
- Use an **island only where the page needs interaction** (cart, filters, forms, pricing toggle, device switch). Every island gets the cheapest hydration directive that works: `client:visible` first, `client:idle` second, `client:load` only with a written reason.
- Do not ship a UI framework to pages that have no islands.
- Pick **one** island framework (React or Preact are both fine with Zustand). Preact is preferred for a smaller bundle. Record the choice in `DECISIONS.md`.

### 3.2 Folder structure

```
src/
  components/
    ui/               # Button, Chip, Card, Frame, Input (no business logic)
    gallery/          # TemplateCard, CategoryFilter, MiniPreview
    layout/           # BaseLayout, Header, Footer
  content/
    templates/        # one JSON or MDX entry per template (content collection)
  content.config.ts   # Zod schemas for collections
  lib/
    schemas/          # Zod schemas shared by server and client
    env.ts            # validated environment variables
    security.ts       # sanitizers, URL helpers
    format.ts         # money, dates
  pages/
    index.astro
    templates/[slug].astro
    api/              # only if SSR is enabled (see section 7)
  stores/             # Zustand stores
  styles/
    global.css
  templates/          # the demo sites, one folder each
    ecommerce/
    blog/
    healthcare/
    restaurant/
    portfolio/
    saas/
public/
```

Rules:
- A template folder owns its components, data and styles. Templates **never import from each other**. Shared code lives in `components/ui` or `lib`.
- `components/ui` has no knowledge of any template.
- No file over ~200 lines. Split by responsibility.
- Use path aliases (`@/components`, `@/lib`, `@/stores`) configured in `tsconfig.json`.

### 3.3 Content collections with Zod
Template metadata lives in an Astro content collection. The schema is the single source of truth.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color');

const templates = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/templates' }),
  schema: z.object({
    name: z.string().min(2).max(60),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category: z.enum(['commerce', 'content', 'services', 'creative']),
    description: z.string().min(20).max(160),
    pages: z.array(z.string().min(1)).min(1).max(20),
    features: z.array(z.string()).max(6),
    palette: z.object({ bg: hex, ink: hex, accent: hex }),
    fonts: z.object({ heading: z.string(), body: z.string() }),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { templates };
```

Build must **fail** if any entry is invalid. Do not catch and hide schema errors.

---

## 4. State management (Zustand)

Rules:
- One store per domain (`useCartStore`, `useGalleryStore`, `usePreviewStore`). No single global mega-store.
- Stores hold **state and actions only**. Derived values are selectors, not stored fields.
- Always subscribe with a **selector** (`useCartStore(s => s.count)`), never the whole store, to prevent extra renders.
- Use `useShallow` when selecting several fields.
- Keep state serializable (no class instances, no functions inside state data).
- **Islands do not share a React tree**, so shared state must live in a store module-level singleton (Zustand does this by default). Do not pass state through props across islands.
- Persist only what is safe and useful (cart items, device choice) with the `persist` middleware, `partialize` to whitelist fields, a `version` number, and a `migrate` function.
- **Never persist anything sensitive** (no emails, names, tokens, form contents).
- Validate persisted data with Zod when rehydrating. If parsing fails, discard it and start clean.
- Guard against SSR: access `localStorage` only on the client. Use `createJSONStorage(() => localStorage)` inside a client-only path and wrap in try/catch (storage can throw in private mode).

Example:

```ts
// src/stores/cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';

const CartItem = z.object({
  id: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(99),
});
const PersistedCart = z.object({ items: z.array(CartItem).max(100) });

type CartState = {
  items: z.infer<typeof CartItem>[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (id) =>
        set((s) => {
          const found = s.items.find((i) => i.id === id);
          if (found) {
            return { items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i)) };
          }
          return { items: [...s.items, { id, qty: 1 }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'th-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      merge: (persisted, current) => {
        const parsed = PersistedCart.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0);
```

---

## 5. Validation (Zod)

**Treat every boundary as untrusted:** form input, URL params, localStorage, `fetch` responses, environment variables, content files.

Rules:
- Define schemas once in `src/lib/schemas/` and derive types with `z.infer`. Do not hand-write duplicate TypeScript types.
- Use `safeParse` (never bare `parse`) at runtime boundaries and handle the failure path with a clear user message.
- Use `.trim()`, length limits (`.min`, `.max`) and `.strict()` on objects that come from outside, so unknown keys are rejected.
- Validate **URL query params** (the gallery category) against an enum; fall back to a default on failure.
- Validate **environment variables** once at startup in `src/lib/env.ts`. Only variables prefixed `PUBLIC_` may be read on the client.
- The same schema validates a form on the client (UX) and again on the server (security). Client validation is never a security control.
- Error messages are written for people ("Enter an email like name@example.com"), not for developers.

Example form schemas:

```ts
// src/lib/schemas/forms.ts
import { z } from 'zod';

export const NewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter an email like name@example.com').max(254),
}).strict();

export const BookingSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: z.string().trim().regex(/^(\+63|0)9\d{9}$/, 'Enter a Philippine mobile number, like 09171234567'),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(['08:00', '09:30', '11:00', '14:00', '15:30', '17:00']),
  notes: z.string().trim().max(500).optional(),
}).strict();

export type Newsletter = z.infer<typeof NewsletterSchema>;
export type Booking = z.infer<typeof BookingSchema>;
```

---

## 6. Tailwind CSS

- Use Tailwind utilities directly. Do not write custom CSS unless a utility cannot express it.
- Define the design system in the theme (`@theme` in v4 or `tailwind.config` in v3): colors, fonts, radii, spacing. No arbitrary hex values (`bg-[#2B3FF0]`) in components.
- **Each demo template gets its own scoped theme** through CSS variables set on the template's root element (`--t-bg`, `--t-ink`, `--t-accent`) and mapped to utilities (`bg-t-bg`, `text-t-ink`). This lets one site hold six different visual identities without class collisions.
- Mobile first. Start with the base style, add `sm:`, `md:`, `lg:` for larger screens.
- Never build class names dynamically (`` `bg-${color}-500` ``). Tailwind cannot see them and they will be purged. Use full static class names or a lookup object.
- Extract repeated markup into components, not into `@apply` blocks.
- Use `clsx` + `tailwind-merge` in a single `cn()` helper for conditional classes.
- Support dark mode with `prefers-color-scheme` and a `data-theme` override for the Hub chrome. Each demo template can opt out and keep its own look.
- Respect `prefers-reduced-motion`.
- Load fonts with `@fontsource` packages (self-hosted) instead of a third-party stylesheet. Preload only the weights actually used. Set `font-display: swap`.

---

## 7. Security (non-negotiable)

Treat this site as public and hostile traffic. Apply all of the following.

### 7.1 Output and XSS
- **Never** use `set:html`, `dangerouslySetInnerHTML` or `innerHTML` with any dynamic or user-supplied value. If rich text is unavoidable, sanitize it with `DOMPurify` (client) or `sanitize-html` (build/server) using an allowlist, and document why.
- Astro and JSX escape text by default. Keep it that way.
- Validate every URL before using it as `href` or `src`. Allow only `http:`, `https:`, `mailto:` and `tel:`. Reject `javascript:`, `data:` and `vbscript:`. Put this in `lib/security.ts` and test it.
- External links use `rel="noopener noreferrer"` and `target="_blank"` only when needed.

### 7.2 Headers and CSP
Set security headers on every response (host config such as `_headers` for Netlify/Cloudflare Pages, `vercel.json`, or Astro middleware if SSR):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
```

- Prefer **no inline scripts**. If Astro emits inline scripts, enable Astro's CSP support or use hashes. Do not weaken `script-src` with `'unsafe-inline'`.
- Do not add third-party scripts (analytics, chat widgets, tag managers) without a written reason, and add the exact origin to the CSP when approved.

### 7.3 Forms and any server endpoint
The demo forms do **not** send data anywhere in v1. They validate and show a success message that says it is a demo. If you later add a real endpoint:
- Use SSR with an adapter and **validate the body with the shared Zod schema** server-side.
- Accept only the expected method and `Content-Type`. Reject bodies over a small limit (for example 10 KB).
- Add rate limiting and a honeypot field. Add CSRF protection (origin check plus a token) for any state-changing request.
- Return generic error messages. Never echo stack traces or raw input.
- Never log personal data.

### 7.4 Secrets and environment
- Secrets never go in the repo or in client code. Use `.env` locally (git-ignored) and the host's secret store in production.
- Commit `.env.example` with variable names only.
- Only `PUBLIC_*` variables are exposed to the browser. Treat that prefix as "this will be public".
- Run `pnpm audit` in CI. Enable Dependabot or Renovate.

### 7.5 Dependencies and supply chain
- Fewer dependencies is better. Justify each new one in a PR note.
- Pin versions through the lockfile. Review changelogs for major bumps.
- Do not install packages that run arbitrary postinstall scripts without review.

### 7.6 Storage and privacy
- localStorage holds only non-sensitive UI state (section 4). Never store personal data.
- No tracking cookies. If analytics are added later, use a privacy-first tool and add a short privacy page.

### 7.7 Images and files
- Use Astro's `<Image />` / `astro:assets` for local images so they are resized and have dimensions.
- Do not accept file uploads in v1.

---

## 8. Performance

- Target Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO for the gallery and for each template page.
- Ship **zero JS** on pages without islands. Check the build output.
- Lazy-load below-the-fold islands (`client:visible`).
- Every image has `width`, `height` and meaningful `alt` (empty `alt=""` for decoration).
- Largest Contentful Paint element is not lazy-loaded.
- Avoid layout shift: reserve space for images, frames and the device preview.
- Keep each island's JS small. Do not import a whole library for one function.
- Use `astro:prefetch` for template links.

---

## 9. Accessibility (WCAG 2.2 AA)

- Semantic HTML first: `header`, `nav`, `main`, `footer`, `button` for actions, `a` for navigation. No clickable `div`s.
- Every interactive element is reachable and operable by keyboard with a visible focus ring.
- Filter chips and device switches are real buttons with `aria-pressed`. Tabs follow the ARIA tabs pattern.
- Form fields have a `<label>`. Errors are linked with `aria-describedby` and announced (`role="alert"` or `aria-live="polite"`).
- Text contrast is at least 4.5:1 (3:1 for 24px+). Check every demo template palette, including the restaurant's dark theme.
- Touch targets are at least 44×44px.
- Add a "Skip to content" link.
- Honor `prefers-reduced-motion` and do not rely on color alone to show state.
- The device-switch preview is a visual resize only and must not trap focus.

---

## 10. SEO and metadata

- One `<title>` and `<meta name="description">` per page, unique and specific.
- Canonical URL, Open Graph and Twitter tags in `BaseLayout`.
- `sitemap.xml` (`@astrojs/sitemap`) and `robots.txt`.
- Clean slugs. A friendly 404 page.
- Demo templates are previews: add `noindex` to the inner demo routes if they are served as separate pages, so search engines index the Hub and not 6 fake shops.

---

## 11. Code quality

- TypeScript strict. No `any`. Use `unknown` and narrow with Zod.
- ESLint (`eslint-plugin-astro`, `@typescript-eslint`, `jsx-a11y`) and Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`). Run on commit with `lint-staged` and `husky`.
- `astro check` must pass with zero errors.
- Naming: components `PascalCase`, files for non-components `kebab-case`, stores `useXStore`, schemas `XSchema`.
- Small pure functions in `lib/` with unit tests (Vitest): `format`, `security`, schema edge cases, store actions and selectors.
- A few Playwright tests for the critical paths: filter the gallery, add to cart, submit booking with bad then good input, switch device.
- Comments explain **why**, not what. No dead code, no commented-out blocks.
- Conventional Commits for history.

---

## 12. Delivery plan

Work in this order. After each step, run `pnpm lint`, `pnpm astro check`, and `pnpm build`, and fix everything before moving on.

1. **Scaffold**: Astro + TypeScript strict, Tailwind, ESLint/Prettier, Vitest, path aliases, `.env.example`, `.nvmrc`, security headers file.
2. **Foundation**: theme tokens, `BaseLayout`, `ui` components, `cn()` helper, `security.ts`, `env.ts`.
3. **Content**: collection schema and the six template JSON entries.
4. **Gallery page**: cards, mini previews, category filter synced to the URL (validated with Zod).
5. **Template page**: browser frame, device switch (`usePreviewStore`), details panel.
6. **Demo templates**, one at a time, each with its islands, store usage and form schemas. Start with ecommerce (cart store), then healthcare (booking schema), then the rest.
7. **Hardening**: CSP verified in the browser console with no violations, a11y pass, Lighthouse pass, bundle check, `pnpm audit`.
8. **Tests and docs**: unit tests, Playwright smoke tests, `README.md` (setup, scripts, structure), `DECISIONS.md`.

---

## 13. Definition of done

- [ ] `pnpm build` succeeds and `astro check` has zero errors and zero warnings.
- [ ] ESLint and Prettier pass. Tests pass.
- [ ] Every external input (forms, URL, storage, env, content) is validated with Zod.
- [ ] No `set:html` / `innerHTML` with dynamic data. No inline event handlers.
- [ ] Security headers present. No CSP violations in the console.
- [ ] No secrets in the repo. `.env.example` exists.
- [ ] Keyboard-only walkthrough works for every interaction. Contrast checked.
- [ ] Lighthouse 95+ on all four categories for the gallery and two template pages.
- [ ] Pages without islands ship no JavaScript.
- [ ] README explains how to run, build, test and add a new template.

## 14. How to add a new template (document this in the README)

1. Add `src/content/templates/<slug>.json` that passes the schema.
2. Create `src/templates/<slug>/` with its components, data, and a scoped theme.
3. Register the demo in the template page's component map.
4. Add form schemas to `src/lib/schemas/` if it has forms.
5. Add a Playwright smoke test and check contrast for its palette.

---

## 15. Rules for you (the assistant)

- Ask before adding any dependency that is not listed here.
- Do not invent features outside section 2.
- Do not skip security or accessibility items to save time. If one cannot be met, say which and why.
- Show a short plan before each delivery step, then implement it.
- When finished with a step, list what changed and what you verified (commands you ran and their results).
