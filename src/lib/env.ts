import { z } from "zod";
const result = z
  .object({ PUBLIC_SITE_URL: z.url().optional() })
  .strict()
  .safeParse({ PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL || undefined });
if (!result.success)
  throw new Error("PUBLIC_SITE_URL must be a valid absolute URL");
export const env = result.data;
