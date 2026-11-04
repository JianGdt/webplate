import { test, expect } from "@playwright/test";
test("gallery filters, URL and back navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/category=services/);
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(3);
  await page.reload();
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(3);
  await page.getByRole("button", { name: "Creative", exact: true }).click();
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(1);
  await page.goBack();
  await expect(page.locator("[data-template-card]:visible")).toHaveCount(3);
});
test("shop adds and persists the bag", async ({ page }) => {
  await page.goto("/demos/ecommerce/");
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Add to cart" })
    .first()
    .scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Bag (1)" })).toBeVisible();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByRole("link", { name: "Bag (0)" })).toBeVisible();
});
test("booking validates and confirms a demo", async ({ page }) => {
  await page.goto("/demos/healthcare/");
  await page.getByRole("button", { name: "Confirm appointment" }).click();
  await expect(page.getByText("Enter your full name")).toBeVisible();
  await page.getByLabel("Full name").fill("Bea Reyes");
  await page.getByLabel("Mobile number").fill("09171234567");
  await page.getByLabel("Preferred day").fill("2026-11-05");
  await page.getByRole("button", { name: "Confirm appointment" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Demo appointment confirmed",
  );
});
test("device switch changes the frame and survives reload", async ({
  page,
}) => {
  await page.goto("/templates/blog/");
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 358);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("newsletter, menu keyboard, portfolio and pricing work", async ({
  page,
}) => {
  await page.goto("/demos/blog/");
  await page.getByRole("button", { name: "Join the newsletter" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Your email address").fill("bea@example.com");
  await page.getByRole("button", { name: "Join the newsletter" }).click();
  await expect(page.getByRole("status")).toContainText("No email was sent");
  await page.goto("/demos/restaurant/");
  await page.getByRole("tab", { name: "Small" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Mains" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goto("/demos/portfolio/");
  await page.getByRole("button", { name: "Digital", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A—form" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Offscript" })).toHaveCount(0);
  await page.goto("/demos/saas/");
  await page.getByRole("button", { name: "Yearly · save 20%" }).click();
  await expect(page.getByText("₱392", { exact: false })).toBeVisible();
});
test("mobile pages fit and production CSP has no violations", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (
      msg.text().includes("Content Security Policy") ||
      msg.text().includes("violates")
    )
      violations.push(msg.text());
  });
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of [
    "/",
    "/templates/ecommerce/",
    "/demos/ecommerce/",
    "/demos/blog/",
    "/demos/healthcare/",
    "/demos/restaurant/",
    "/demos/portfolio/",
    "/demos/saas/",
  ]) {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(violations).toEqual([]);
});

test("design layouts fit every specified viewport", async ({ page }) => {
  for (const width of [1360, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/templates/blog/"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.getByRole("button", { name: "Tablet", exact: true }).click();
  await expect(page.locator("iframe")).toHaveJSProperty("clientWidth", 638);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await expect(page.locator(".device-frame")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.goto("/?category=invalid");
  await expect(
    page.getByRole("button", { name: "All templates", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("3 templates in Services");
});
