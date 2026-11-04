import { test, expect } from "@playwright/test";
test("rapid filters and device switches settle without leaving content hidden", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const name of ["Services", "Systems", "Creative", "All templates"])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(10);
  await expect(page.locator("[data-template-card]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.goto("/templates/crm/");
  for (const name of ["Phone", "Tablet", "Phone"])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 358);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Tablet", exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 638);
  await page.goto("/");
  await expect(page.locator("[data-motion-reveal]").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator("[data-motion-reveal]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  expect(errors).toEqual([]);
});

test("liquid navigation retargets and snaps for reduced motion", async ({
  page,
}) => {
  await page.goto("/demos/crm/");
  const nav = page.locator("[data-liquid-tabs]");
  for (const name of ["Contacts", "Pipeline", "Overview", "Contacts"])
    await nav.getByRole("button", { name, exact: true }).click();
  const settled = async () => {
    const active = await nav.locator('[aria-pressed="true"]').boundingBox();
    const blob = await nav.locator("[data-liquid-indicator]").boundingBox();
    return (
      !!active &&
      !!blob &&
      Math.abs(active.x - blob.x) < 1 &&
      Math.abs(active.y - blob.y) < 1 &&
      Math.abs(active.width - blob.width) < 1
    );
  };
  await expect.poll(settled).toBe(true);
  await page.screenshot({ path: "/tmp/webplate-crm.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(settled).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await nav.getByRole("button", { name: "Overview", exact: true }).click();
  await expect.poll(settled).toBe(true);
  await page.screenshot({
    path: "/tmp/webplate-crm-mobile.png",
    fullPage: true,
  });
  await page.goto("/demos/healthcare-dashboard/");
  await expect(page.locator('[data-slot="chart"]').first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Appointments", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".recharts-area").first()).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "/tmp/webplate-healthcare.png",
    fullPage: true,
  });
});

test("collection links and all filter controls use liquid highlights", async ({
  page,
}) => {
  await page.goto("/templates/ecommerce/");
  const collection = page.getByLabel("Template collection");
  await expect(collection).toHaveAttribute("data-liquid-ready", "true");
  await collection.getByRole("link", { name: /Mendoza Clinic/ }).click();
  await expect(page).toHaveURL(/\/templates\/healthcare\/$/);
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "/demos/healthcare/",
  );
  await expect(page.getByLabel("Template collection")).toHaveAttribute(
    "data-liquid-ready",
    "true",
  );
  await page.screenshot({
    path: "/tmp/webplate-collection.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(
    page.getByLabel("Preview device").locator("[data-liquid-indicator]"),
  ).toHaveCSS("background-color", "rgb(242, 244, 248)");
  await page.goto("/");
  await page.getByRole("button", { name: "Systems", exact: true }).click();
  await expect(page.getByLabel("Filter templates")).toHaveAttribute(
    "data-liquid-ready",
    "true",
  );
  for (const slug of ["restaurant", "saas", "ecommerce", "blog", "portfolio"]) {
    await page.goto(`/demos/${slug}/`);
    await expect(page.locator("[data-liquid-surface]").first()).toHaveAttribute(
      "data-liquid-ready",
      "true",
    );
  }
});

test("expanded motion resets on reduced motion and leaves charts readable", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator("[data-template-card] > a:first-child").first();
  await card.hover();
  await expect(card).not.toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card).toHaveCSS("transform", "none");
  await page.goto("/demos/cms/");
  const chart = page.getByRole("img", { name: /^Article views:/ });
  await page.getByLabel("Reporting period").selectOption("30 days");
  await expect(chart).toHaveCSS("clip-path", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByLabel("Reporting period").selectOption("7 days");
  await expect(chart).toHaveCSS("clip-path", "none");
  await expect(chart.locator(".recharts-area")).toBeVisible();
});

test("tab switches keep existing metrics and charts visible", async ({
  page,
}) => {
  await page.goto("/demos/crm/");
  await page.getByRole("button", { name: "Contacts", exact: true }).click();
  await expect(page.locator(".dash-stat").first()).toHaveCSS("opacity", "1");
  await expect(page.locator(".dash-stat").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.getByRole("img", { name: /^Pipeline value:/ })).toHaveCSS(
    "clip-path",
    "none",
  );
});

test("preview remains usable when browser storage is blocked", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.goto("/templates/crm/");
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 358);
  expect(errors).toEqual([]);
});

test("preview recovers from a corrupt saved preference", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("th-preview", "invalid-json"),
  );
  await page.goto("/templates/crm/");
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 358);
});
