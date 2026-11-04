import { create } from "zustand";
import { z } from "zod";
export const ArticleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Enter a title with at least 3 characters.")
      .max(100),
    category: z.enum(["Stories", "Guides", "News"]),
    body: z
      .string()
      .trim()
      .min(10, "Write at least 10 characters of content.")
      .max(5000),
    status: z.enum(["Draft", "Published"]),
  })
  .strict();
export type Article = z.infer<typeof ArticleSchema> & {
  id: number;
  views: number;
};
export const useContentStore = create<{
  articles: Article[];
  save: (data: unknown, id?: number) => boolean;
  publish: (id: number) => void;
}>((set) => ({
  articles: [
    {
      id: 1,
      title: "A slower weekend in Siargao",
      category: "Stories",
      body: "A guide to island mornings, local coffee, and the quiet side of Siargao.",
      status: "Published",
      views: 2840,
    },
    {
      id: 2,
      title: "The independent cafés of Makati",
      category: "Guides",
      body: "Meet the people brewing something special in the neighborhood.",
      status: "Published",
      views: 1920,
    },
    {
      id: 3,
      title: "Inside a Manila maker’s studio",
      category: "Stories",
      body: "A conversation about craft, community, and making things that last.",
      status: "Draft",
      views: 0,
    },
    {
      id: 4,
      title: "Our November reading list",
      category: "News",
      body: "Five new books to keep you company through a rainy afternoon.",
      status: "Draft",
      views: 0,
    },
  ],
  save: (data, id) => {
    const parsed = ArticleSchema.safeParse(data);
    if (!parsed.success) return false;
    set((s) => ({
      articles: id
        ? s.articles.map((a) => (a.id === id ? { ...a, ...parsed.data } : a))
        : [
            ...s.articles,
            {
              ...parsed.data,
              id: Math.max(0, ...s.articles.map((a) => a.id)) + 1,
              views: 0,
            },
          ],
    }));
    return true;
  },
  publish: (id) =>
    set((s) => ({
      articles: s.articles.map((a) =>
        a.id === id ? { ...a, status: "Published" } : a,
      ),
    })),
}));
