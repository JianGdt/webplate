import { describe, it, expect, beforeEach } from "vitest";
import { safeUrl } from "../../src/lib/security";
import { money, date } from "../../src/lib/format";
import { NewsletterSchema, BookingSchema } from "../../src/lib/schemas/forms";
import { CategorySchema, TemplateSchema } from "../../src/lib/schemas/template";
describe("URL safety", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "vbscript:test",
    "//evil.example",
    "/\\evil.example",
    "java\nscript:alert(1)",
  ])("rejects %s", (url) => expect(safeUrl(url)).toBe("#"));
  it.each([
    "/templates/blog/",
    "https://example.com",
    "mailto:hello@example.com",
    "tel:+639171234567",
  ])("allows %s", (url) => expect(safeUrl(url)).toBe(url));
});
describe("formatters", () => {
  it("formats pesos", () => expect(money(850)).toContain("850"));
  it("formats dates deterministically", () =>
    expect(date("2026-11-04")).toBe("Nov 4"));
});
describe("boundaries", () => {
  it("normalizes email", () =>
    expect(
      NewsletterSchema.safeParse({ email: "  NAME@example.com " }).data?.email,
    ).toBe("name@example.com"));
  it("rejects unknown fields and invalid email", () => {
    expect(NewsletterSchema.safeParse({ email: "wrong" }).success).toBe(false);
    expect(
      NewsletterSchema.safeParse({ email: "a@b.com", admin: true }).success,
    ).toBe(false);
  });
  it("validates booking contact and real calendar dates", () => {
    const valid = {
      name: "Bea Reyes",
      phone: "09171234567",
      day: "2026-11-05",
      time: "09:30",
    };
    expect(BookingSchema.safeParse(valid).success).toBe(true);
    expect(
      BookingSchema.safeParse({ ...valid, day: "2026-02-31" }).success,
    ).toBe(false);
    expect(BookingSchema.safeParse({ ...valid, phone: "123" }).success).toBe(
      false,
    );
  });
  it("rejects invalid categories and incomplete metadata", () => {
    expect(CategorySchema.safeParse("evil").success).toBe(false);
    expect(TemplateSchema.safeParse({ name: "Test" }).success).toBe(false);
  });
});
import {
  useCartStore,
  selectCartCount,
  CartSchema,
} from "../../src/stores/cart";
beforeEach(() => useCartStore.getState().clear());
it("adds, bounds, removes and derives cart quantities", () => {
  for (let i = 0; i < 110; i++) useCartStore.getState().add("cup");
  expect(selectCartCount(useCartStore.getState())).toBe(99);
  useCartStore.getState().remove("cup");
  expect(selectCartCount(useCartStore.getState())).toBe(0);
});
it("rejects malformed persisted carts", () => {
  expect(
    CartSchema.safeParse({ items: [{ id: "cup", qty: -1 }] }).success,
  ).toBe(false);
  expect(
    CartSchema.safeParse({ items: [], email: "private@example.com" }).success,
  ).toBe(false);
});
