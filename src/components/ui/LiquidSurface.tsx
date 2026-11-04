import { useId, type ComponentProps, type CSSProperties } from "react";
import { useGooeyNav } from "@/components/dashboard/use-gooey-nav";
import { cn } from "@/lib/utils";
export default function LiquidSurface({
  value,
  color = "var(--t-accent)",
  children,
  className,
  style,
  ...props
}: ComponentProps<"div"> & { value: string; color?: string }) {
  const id = `liquid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const root = useGooeyNav(value, "surface");
  return (
    <div
      {...props}
      ref={root}
      data-liquid-surface
      className={cn("relative isolate", className)}
      style={{ ...style, "--liquid-color": color } as CSSProperties}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <filter
            id={id}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ filter: `url(#${id})` }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            data-goo-blob
            data-liquid-indicator={i === 0 ? "" : undefined}
            className="absolute top-0 left-0 rounded-2xl bg-[var(--liquid-color)] opacity-0"
          />
        ))}
      </div>
      {children}
    </div>
  );
}
