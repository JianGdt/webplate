import { it, expect } from "vitest";
import { InquirySchema, inquiryText } from "../../src/lib/schemas/inquiry";
it("rejects short briefs and unknown service choices", () => {
  expect(
    InquirySchema.safeParse({ name: "A", description: "short" }).success,
  ).toBe(false);
  expect(
    InquirySchema.safeParse({
      name: "Studio",
      service: "bad",
      template: "",
      description: "A complete project description.",
      budget: "Let's discuss",
      timeline: "Flexible",
    }).success,
  ).toBe(false);
});
it("prepares an original-project brief without inventing commitments", () => {
  const result = InquirySchema.safeParse({
    name: " Studio ",
    service: "Business website",
    template: "",
    description: "A new website for our small business.",
    budget: "Let's discuss",
    timeline: "Flexible",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    const text = inquiryText(result.data);
    expect(text).toContain("Name / business: Studio");
    expect(text).toContain("Starting point: An original idea");
    expect(text).toContain("Timeline: Flexible");
  }
});
