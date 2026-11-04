import { z } from "zod";
import { categories } from "../template-options";
export const CategorySchema = z.enum(categories);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const TemplateSchema = z
  .object({
    name: z.string().min(2).max(60),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category: z.enum([
      "commerce",
      "content",
      "services",
      "creative",
      "systems",
    ]),
    description: z.string().min(20).max(160),
    pages: z.array(z.string().min(1)).min(1).max(20),
    features: z.array(z.string()).max(6),
    palette: z.object({ bg: hex, ink: hex, accent: hex }).strict(),
    fonts: z.object({ heading: z.string(), body: z.string() }).strict(),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative(),
  })
  .strict();
export type Template = z.infer<typeof TemplateSchema>;
