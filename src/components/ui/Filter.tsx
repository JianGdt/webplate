import LiquidSurface from "@/components/ui/LiquidSurface";
import { cn } from "@/lib/utils";
export default function Filter({
  values,
  value,
  onChange,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <LiquidSurface value={value} className="mb-6 flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          aria-pressed={v === value}
          onClick={() => onChange(v)}
          className={cn(
            "min-h-11 rounded-full border border-current/20 px-5 text-sm",
            v === value ? "bg-t-accent text-t-accent-ink" : "bg-transparent",
          )}
        >
          {v}
        </button>
      ))}
    </LiquidSurface>
  );
}
