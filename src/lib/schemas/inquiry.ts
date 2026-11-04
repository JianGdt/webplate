import { z } from "zod";
export const services = [
  "Business website",
  "Store or product website",
  "CMS, CRM, or inventory dashboard",
  "Template customization",
  "Something else",
] as const;
export const budgets = [
  "Let's discuss",
  "Under ₱10,000",
  "₱10,000–₱30,000",
  "₱30,000–₱60,000",
  "₱60,000+",
] as const;
export const timelines = [
  "Flexible",
  "Within a month",
  "1–3 months",
  "More than 3 months",
] as const;
export const InquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name or business name.")
      .max(100),
    service: z.enum(services),
    template: z.string().max(80),
    description: z
      .string()
      .trim()
      .min(
        20,
        "Tell me a little more about your project (at least 20 characters).",
      )
      .max(3000),
    budget: z.enum(budgets),
    timeline: z.enum(timelines),
  })
  .strict();
export function inquiryText(data: z.infer<typeof InquirySchema>) {
  return `Hi Webplate,\n\nI'd like to discuss a project.\n\nName / business: ${data.name}\nService: ${data.service}\nStarting point: ${data.template || "An original idea"}\nBudget: ${data.budget}\nTimeline: ${data.timeline}\n\nProject details:\n${data.description}\n\nPlease let me know the next steps.`;
}
