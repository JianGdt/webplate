import { create } from "zustand";
import { isCategory, type Category } from "@/lib/template-options";
export const useGalleryStore = create<{
  category: Category;
  setCategory: (value: unknown) => void;
}>((set) => ({
  category: "all",
  setCategory: (value) => {
    set({ category: isCategory(value) ? value : "all" });
  },
}));
