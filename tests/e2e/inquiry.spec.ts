import { test, expect } from "@playwright/test";
test("portfolio explains services and links to the project inquiry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What I can build for you" }),
  ).toBeVisible();
  await expect(
    page.getByText("Dashboard demos show frontend workflows", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Discuss your project", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(
    page.getByRole("link", { name: "jgodito27@gmail.com", exact: true }),
  ).toHaveAttribute("href", "mailto:jgodito27@gmail.com");
});
test("selected template becomes a validated, reviewable email brief", async ({
  page,
}) => {
  await page.goto("/templates/crm/");
  await page
    .getByRole("link", { name: "Discuss your project", exact: false })
    .first()
    .click();
  await expect(page.getByLabel("A demo you like (optional)")).toHaveValue(
    "crm",
  );
  await expect(page.getByLabel("What can I help with?")).toHaveValue(
    "CMS, CRM, or inventory dashboard",
  );
  await page.getByRole("button", { name: "Prepare project brief" }).click();
  await expect(page.getByRole("alert")).toHaveCount(2);
  await page.getByLabel("Your name or business").fill("Santos Studio");
  await page
    .getByLabel("Tell me about your project")
    .fill("We need a CRM to track our sales conversations and opportunities.");
  await page.getByRole("button", { name: "Prepare project brief" }).click();
  await expect(page.getByLabel("Project brief", { exact: true })).toContainText(
    "Starting point: Relationships",
  );
  await expect(
    page.getByText("Nothing has been sent.", { exact: false }),
  ).toBeVisible();
  const href = await page
    .getByRole("link", { name: "Open email app" })
    .getAttribute("href");
  expect(href).toContain("mailto:jgodito27@gmail.com");
  expect(decodeURIComponent(href ?? "")).toContain("Santos Studio");
  await page.getByLabel("Your name or business").fill("Updated studio");
  await expect(page.getByRole("link", { name: "Open email app" })).toHaveCount(
    0,
  );
});
test("invalid template falls back safely and mobile contact fits", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact/?template=not-real");
  await expect(
    page.getByRole("button", { name: "Prepare project brief" }),
  ).toBeEnabled();
  await expect(page.getByLabel("A demo you like (optional)")).toHaveValue("");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
