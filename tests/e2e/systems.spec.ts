import { test, expect } from "@playwright/test";
test("system templates are discoverable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Systems", exact: true }).click();
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(4);
  await expect(page.getByRole("status")).toHaveText("4 templates in Systems");
  await page.getByRole("link", { name: "Explore demo" }).first().click();
  await expect(page.locator("iframe")).toHaveAttribute("src", "/demos/cms/");
});
test("CMS validates, creates, edits, and publishes articles", async ({
  page,
}) => {
  await page.goto("/demos/cms/");
  await page.getByRole("button", { name: "New article", exact: true }).click();
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("title");
  await page.getByLabel("Article title").fill("A new Manila story");
  await page
    .getByLabel("Article content")
    .fill("A practical guide to a quiet weekend in Manila.");
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "A new Manila story" }),
  ).toContainText("Draft");
  await page
    .getByRole("button", { name: "Edit A new Manila story", exact: true })
    .click();
  await page.getByLabel("Article title").fill("A better Manila story");
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await page
    .getByRole("button", { name: "Publish A better Manila story", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "A better Manila story" }),
  ).toContainText("Published");
  await page.getByRole("button", { name: "Sun 720", exact: true }).click();
  await page.getByLabel("Reporting period").selectOption("30 days");
  await expect(
    page.getByRole("img", { name: /Article views: Week 1/ }),
  ).toBeVisible();
});
test("CRM adds contacts and moves opportunities", async ({ page }) => {
  await page.goto("/demos/crm/");
  await page.getByRole("button", { name: "Add contact", exact: true }).click();
  await page.getByLabel("Contact name").fill("Ana Santos");
  await page.getByLabel("Company", { exact: true }).fill("Manila Studio");
  await page.getByLabel("Email address").fill("invalid");
  await page.getByLabel("Deal value (₱)").fill("50000");
  await page.getByRole("button", { name: "Save contact" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Email address").fill("ana@example.com");
  await page.getByRole("button", { name: "Save contact" }).click();
  await page.getByRole("button", { name: "Pipeline", exact: true }).click();
  await page.getByLabel("Deal stage for Manila Studio").selectOption("Won");
  await expect(page.getByRole("status")).toContainText("Won");
  await expect(
    page.locator(".dash-stat").filter({ hasText: "Won revenue" }),
  ).toContainText("86,000");
});
test("inventory validates stock, logs movements, and rejects duplicate SKUs", async ({
  page,
}) => {
  await page.goto("/demos/inventory/");
  await page
    .getByRole("button", { name: "Adjust Stoneware cup", exact: true })
    .click();
  await page.getByLabel("Movement type").selectOption("Dispatch");
  await page.getByLabel("Units", { exact: true }).fill("99");
  await page.getByRole("button", { name: "Confirm adjustment" }).click();
  await expect(page.getByRole("alert")).toContainText("Not enough stock");
  await page.getByLabel("Movement type").selectOption("Receive");
  await page.getByLabel("Units", { exact: true }).fill("10");
  await page.getByRole("button", { name: "Confirm adjustment" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Stoneware cup" }),
  ).toContainText("18");
  await page.getByRole("button", { name: "Movements", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Stoneware cup" }),
  ).toContainText("+10");
  await page.getByRole("button", { name: "Products", exact: true }).click();
  await page.getByRole("button", { name: "Add product" }).click();
  await page.getByLabel("Product name", { exact: true }).fill("New cup");
  await page.getByLabel("SKU", { exact: true }).fill("HOM-002");
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  await page.getByLabel("SKU", { exact: true }).fill("HOM-006");
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "New cup" }),
  ).toBeVisible();
});
test("dashboards fit mobile and run without CSP or JavaScript errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1360, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ["cms", "crm", "inventory", "healthcare-dashboard"]) {
      await page.goto(`/demos/${slug}/`);
      await expect(
        page.locator('.dash-rail [role="navigation"] button').first(),
      ).toBeEnabled();
      await expect(
        page.locator('.dash-rail [role="navigation"] button'),
      ).toHaveText(
        slug === "cms"
          ? ["Overview", "Articles"]
          : slug === "crm"
            ? ["Overview", "Pipeline", "Contacts"]
            : slug === "inventory"
              ? ["Overview", "Products", "Movements"]
              : ["Overview", "Appointments", "Analytics"],
      );
      await expect(page.locator('.dashboard a[href^="/demos/"]')).toHaveCount(
        0,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator("[data-reveal]").first()).toHaveCSS(
        "opacity",
        "1",
      );
    }
  }
  expect(errors).toEqual([]);
});

test("healthcare schedules appointments and updates status", async ({
  page,
}) => {
  await page.goto("/demos/healthcare-dashboard/");
  await page.getByRole("button", { name: "Appointments", exact: true }).click();
  await page.getByRole("button", { name: "New appointment" }).click();
  await page.getByLabel("Patient display name").fill("Patient E");
  await page.getByRole("button", { name: "Save appointment" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "already has an appointment",
  );
  await page.getByLabel("Appointment time").selectOption("14:00");
  await page.getByRole("button", { name: "Save appointment" }).click();
  const row = page.getByRole("row").filter({ hasText: "Patient E" });
  await expect(row).toBeVisible();
  await row.getByRole("combobox").selectOption("Checked in");
  await expect(row.getByRole("combobox")).toHaveValue("Checked in");
  const overview = page
    .locator("[data-liquid-tabs]")
    .getByRole("button", { name: "Overview", exact: true });
  await overview.focus();
  await overview.press("End");
  await expect(
    page.getByRole("button", { name: "Analytics", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-liquid-indicator]")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator('[data-slot="chart"]')).toHaveCount(2);
});
