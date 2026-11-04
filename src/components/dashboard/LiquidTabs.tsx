import LiquidSurface from "@/components/ui/LiquidSurface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function LiquidTabs({
  items,
  value,
  onChange,
  disabled = false,
  label,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <LiquidSurface
      value={value}
      color="var(--accent)"
      role="navigation"
      aria-label={label}
      className="relative isolate flex gap-2 overflow-x-auto rounded-xl p-1 min-[701px]:grid"
      data-liquid-tabs
    >
      {items.map((item) => (
        <Button
          type="button"
          key={item}
          data-value={item}
          disabled={disabled}
          aria-pressed={value === item}
          variant="ghost"
          onKeyDown={(e) => {
            if (
              ![
                "ArrowRight",
                "ArrowLeft",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ].includes(e.key)
            )
              return;
            e.preventDefault();
            const buttons = Array.from(
              e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                "button",
              ),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? items.length - 1
                  : (index +
                      (["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1) +
                      items.length) %
                    items.length;
            buttons[next]?.focus();
            onChange(items[next]);
          }}
          onClick={() => onChange(item)}
          className={cn(
            "relative min-h-11 justify-start px-4 text-left text-sm hover:bg-transparent focus-visible:ring-2",
            value === item
              ? "text-primary font-semibold"
              : "text-muted-foreground",
          )}
        >
          {item}
        </Button>
      ))}
    </LiquidSurface>
  );
}
