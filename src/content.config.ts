import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { TemplateSchema } from "./lib/schemas/template";
export const collections = {
  templates: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/templates" }),
    schema: TemplateSchema,
  }),
};
