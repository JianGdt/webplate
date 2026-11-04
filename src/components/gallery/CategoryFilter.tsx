import LiquidSurface from "@/components/ui/LiquidSurface";
import { useEffect, useRef, useState } from "react";
import { useGalleryStore } from "@/stores/gallery";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
const categories = [
  ["all", "All templates", "◫"],
  ["commerce", "Commerce", "▧"],
  ["content", "Content", "▤"],
  ["services", "Services", "✳"],
  ["creative", "Creative", "◇"],
  ["systems", "Systems", "▦"],
] as const;
export default function CategoryFilter() {
  const previousCategory = useRef("all");
  const [ready, setReady] = useState(false);
  const category = useGalleryStore((s) => s.category);
  const setCategory = useGalleryStore((s) => s.setCategory);
  useEffect(() => {
    const sync = () =>
      setCategory(
        new URLSearchParams(location.search).get("category") || "all",
      );
    sync();
    setReady(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [setCategory]);
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(
      "[data-template-card]",
    );
    cards.forEach((el) => {
      el.hidden = category !== "all" && el.dataset.category !== category;
    });
    const count = Array.from(cards).filter((el) => !el.hidden).length;
    const result = document.querySelector("[data-result-count]");
    if (result)
      result.textContent = `${count} ${count === 1 ? "template" : "templates"} in ${categories.find(([value]) => value === category)?.[1] ?? "All templates"}`;
    const empty = document.querySelector<HTMLElement>("[data-empty-result]");
    if (empty) empty.hidden = count > 0;
    const changed = previousCategory.current !== category;
    previousCategory.current = category;
    if (!changed) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        Array.from(cards).filter((el) => !el.hidden),
        { y: 24, scale: 0.985 },
        {
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.045,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    });
    return () => media.revert();
  }, [category]);
  function select(value: string) {
    setCategory(value);
    const url = new URL(location.href);
    if (value === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", value);
    history.pushState({}, "", url);
  }
  return (
    <LiquidSurface
      value={category}
      color="var(--hub-ink)"
      className="flex flex-wrap gap-2"
      aria-label="Filter templates"
    >
      {categories.map(([value, label, icon]) => (
        <button
          key={value}
          disabled={!ready}
          onClick={() => select(value)}
          aria-pressed={category === value}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px]",
            category === value
              ? "border-hub-ink bg-hub-ink text-hub-bg font-semibold"
              : "border-hub-line text-hub-muted hover:bg-hub-surface",
          )}
        >
          <span aria-hidden="true">{icon}</span>
          {label}
        </button>
      ))}
    </LiquidSurface>
  );
}
