export const categories = [
  "all",
  "commerce",
  "content",
  "services",
  "creative",
  "systems",
] as const;
export type Category = (typeof categories)[number];
export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    (categories as readonly string[]).includes(value)
  );
}
