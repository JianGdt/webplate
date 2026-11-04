# Template Hub: Design Spec

Use this file together with `TEMPLATE-HUB-PROMPT.md` (stack, security, best practices) and `EDITOR-AND-EXPORT.md` (inline editing and standalone HTML export). This file describes how the Hub should **look and behave**.

The design canvas has three layouts. Build the one named in your prompt (default: **A. Gallery** for `/`, **B. Workbench** for `/templates/[slug]`). **C. Index** is an optional alternative home page.

---

## 1. Design tokens

Define these once in the Tailwind theme. Do not use raw hex values in components.

### Hub chrome (the Hub's own UI)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--hub-bg` | `#EEF0F4` | `#11141B` | Page background |
| `--hub-panel` | `#F7F8FA` | `#171B24` | Rails, side panels |
| `--hub-surface` | `#FFFFFF` | `#1E2330` | Active items, inputs |
| `--hub-ink` | `#11141B` | `#F2F4F8` | Primary text |
| `--hub-muted` | `#5B6270` | `#A9B0C0` | Secondary text (4.5:1 minimum) |
| `--hub-line` | `#D3D7E0` | `#2A3040` | Borders, dividers |
| `--hub-accent` | `#2B3FF0` | `#7C8BFF` | Primary buttons, focus ring |
| `--hub-accent-ink` | `#FFFFFF` | `#0B1033` | Text on accent |

Use one accent. Never add a second brand color. Semantic colors (success, error) are separate and used only for status.

### Typography

| Role | Font | Weights | Use |
| --- | --- | --- | --- |
| Display | Bricolage Grotesque | 700, 800 | Headings, template names, brand |
| Body | Figtree | 400, 500, 600 | Paragraphs, buttons, labels |
| Mono | IBM Plex Mono | 400, 500 | Eyebrows, counts, URLs, hex values |

Self-host with `@fontsource` packages. Do not load Google Fonts from a third-party stylesheet.

Type scale (px / line-height):
- Hero: 64 / 1.0, tracking `-0.03em`, weight 800, `text-wrap: balance`
- Page title: 30 / 1.1, weight 800
- Card title: 22 / 1.2, weight 700
- Body large: 17 / 1.55
- Body: 15 / 1.5
- Small: 13 / 1.4
- Eyebrow (mono): 12, uppercase, tracking `0.12em`

Body text is limited to about 65 characters wide.

### Shape and space
- Radius: chips 999px, buttons 8px, cards and frames 12px, thumbnails 12px.
- Spacing scale: 4, 8, 12, 16, 24, 28, 36, 48, 64.
- Page gutter: 48px on desktop, 16px minimum on phones.
- Touch targets: at least 44px high.
- Borders are 1px `--hub-line`. Use shadows only on the floating preview frame.

---

## 2. Layout A: Gallery (`/`)

Purpose: help a visitor find a template quickly.

Structure, top to bottom:
1. **Header row.** Left: mono eyebrow `Template Hub · N templates`, a hero heading ("Start from a site that already works."), one sentence of body text. Right (wraps below on narrow screens): category filter chips.
2. **Result bar.** A 1px top rule, left: mono count ("6 templates in Services"). Right: sort label ("Sorted by most used").
3. **Card grid.** `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, gap 28px.

Template card:
- Mini preview (210px high, radius 12, 1px ring). Built from simple shapes in the template's own colors: fake browser dots and a nav bar, a hero with two heading bars, one text bar and a button bar beside a shape, then three small blocks.
- Row: template name (display, 22px) and mono page count ("8 pages") on the right.
- One-line description.
- Row: two outline tags (category, key feature) and an **Open template** button on the right.

Filter chips: pill buttons. Active = ink background, white text. Inactive = transparent, 1px border. Use `aria-pressed`. The active filter is stored in the URL (`?category=services`) and validated with Zod.

States: empty result ("No templates in this category yet"), loading (skeleton cards with the same height), hover (card preview lifts 2px, respects reduced motion).

---

## 3. Layout B: Workbench (`/templates/[slug]`)

Purpose: preview one template at different device sizes and read its details.

Three columns, built as a wrapping flex row so it stacks on narrow screens:

1. **Top bar** (dark, full width): brand and the template URL (mono) on the left. Right: device switch (Desktop, Tablet, Phone) and the **Use this template** button.
2. **Left rail** (264px): list of templates. Each item shows a color dot, name and a short subtitle. Active item has a white surface and 1px border.
3. **Center stage** (flexible): a browser frame (dots and URL bar) holding the live template. Frame width: Desktop 100%, Tablet 640px, Phone 360px. Width changes animate unless reduced motion is on.
4. **Right panel** (300 to 340px): name, description, **Pages included** (chips), **Colors** (three swatches with hex in mono), **Fonts**.

At widths under 900px the left rail becomes a horizontal scroll row above the stage, and the right panel moves below it.

---

## 4. Layout C: Index (optional home)

Dark page. A list of large template names (56px display), each with its category in mono on the right, separated by 1px rules. The active name is white, the others muted. Hover or keyboard focus changes the preview on the right (browser-frame thumbnail, description, page chips, **Open** button). The list is a real `<ul>` of `<button>` or `<a>` elements, so Tab works.

---

## 5. The six demo templates

Each demo is a full site with its own scoped theme (CSS variables on its root). They do not use Hub tokens.

| Template | Background | Ink | Accent | Heading font | Key interaction |
| --- | --- | --- | --- | --- | --- |
| Ecommerce (Kiln & Co.) | `#E7ECFA` | `#18202C` | `#2B3FF0` | Syne | Category filter, add to cart |
| Blog (Field Notes) | `#F4F4EF` | `#171717` | `#0B7A53` | DM Serif Display | Topic filter, newsletter |
| Healthcare (Mendoza Clinic) | `#E4F3F5` | `#0D2A33` | `#0A8F97` | Manrope | Day and time picker |
| Restaurant (Sinag Kitchen) | `#1E1815` | `#F2E8DC` | `#E9A23B` | DM Serif Display | Menu tabs |
| Portfolio (Mara Reyes) | `#FFFFFF` | `#0B0B0D` | `#FF3B7A` | Syne | Project filter |
| SaaS (Tally) | `#EDEFFC` | `#11183A` | `#3552F5` | Manrope | Monthly/yearly toggle |

Content rules: realistic names, Philippine pesos (`₱1,250`), local places, no lorem ipsum. Check text contrast on each palette, especially the dark restaurant theme.

---

## 6. Motion

- Maximum one motion idea per screen: the device-width change in the Workbench, or the card lift in the Gallery.
- Durations 150 to 250ms, ease-out.
- Wrap all motion in `prefers-reduced-motion: no-preference`.

## 7. Responsive rules

- Design at 1360px, verify at 1024, 768 and 390.
- No horizontal page scroll at any width.
- Grids use `minmax(0, 1fr)` and flex children get `min-width: 0` so long text wraps.
- Wide tables or code sit in their own `overflow-x: auto` box.

## 8. Accessibility checklist for the design

- Visible focus ring: 2px `--hub-accent`, 2px offset, on every interactive element.
- All icon-only buttons have `aria-label`.
- Active states are not shown by color alone (use weight, border or `aria-pressed`).
- Skip link at the top of every page.
- Heading order is logical: one `h1` per page.

## 9. Copy rules

- Name things by what people do ("Open template", "Use this template"), not by system terms.
- Short, direct sentences. No exclamation marks.
- Errors say what happened and how to fix it.
