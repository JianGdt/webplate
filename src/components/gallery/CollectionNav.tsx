import { useEffect, useRef, useState } from "react";
import LiquidSurface from "@/components/ui/LiquidSurface";
import type { Template } from "@/lib/schemas/template";
export default function CollectionNav({
  templates,
  current,
}: {
  templates: (Pick<Template, "slug" | "name" | "category"> & {
    accent: string;
    feature: string;
  })[];
  current: string;
}) {
  const [selected, setSelected] = useState(current);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <LiquidSurface
      value={selected}
      color="var(--hub-surface)"
      className="flex gap-2 overflow-x-auto pb-2 min-[900px]:flex-col min-[900px]:overflow-visible"
      aria-label="Template collection"
    >
      {templates.map((item) => (
        <a
          key={item.slug}
          data-astro-prefetch="hover"
          data-liquid-link
          data-liquid-selected={selected === item.slug}
          href={`/templates/${item.slug}/`}
          aria-current={item.slug === current ? "page" : undefined}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            )
              return;
            if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            event.preventDefault();
            clearTimeout(timer.current);
            setSelected(item.slug);
            if (item.slug !== current)
              timer.current = setTimeout(
                () => location.assign(`/templates/${item.slug}/`),
                480,
              );
          }}
          className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border border-transparent p-3 min-[900px]:min-w-0 ${selected === item.slug ? "bg-hub-surface text-hub-ink font-semibold" : "text-hub-muted"}`}
        >
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ background: item.accent }}
          />
          <span>
            <span className="block text-[15px]">{item.name}</span>
            <span className="text-hub-muted block text-xs font-normal capitalize">
              {item.category} · {item.feature}
            </span>
          </span>
        </a>
      ))}
    </LiquidSurface>
  );
}
