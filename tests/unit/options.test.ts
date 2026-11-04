import { expect, it } from "vitest";
import { categories, isCategory } from "../../src/lib/template-options";
import { CategorySchema } from "../../src/lib/schemas/template";
import { readSaved } from "../../src/stores/preview";
it("lightweight gallery validation matches the content schema", () => {
  for (const value of [...categories, "unknown", null, {}, 1])
    expect(isCategory(value)).toBe(CategorySchema.safeParse(value).success);
});
it("saved device validation rejects malformed and extra fields", () => {
  expect(readSaved({ device: "phone" })).toEqual({ device: "phone" });
  for (const value of [
    null,
    [],
    { device: "bad" },
    { device: "phone", injected: true },
  ])
    expect(readSaved(value)).toBeUndefined();
});
