import LiquidSurface from "@/components/ui/LiquidSurface";
import { useEffect, useState } from "react";
import { hydratePreview, usePreviewStore } from "@/stores/preview";
import { cn } from "@/lib/utils";
export default function DeviceSwitch() {
  const [ready, setReady] = useState(false);
  const device = usePreviewStore((s) => s.device);
  const setDevice = usePreviewStore((s) => s.setDevice);
  useEffect(() => {
    hydratePreview()
      .finally(() => setReady(true))
      .catch(() => setReady(true));
  }, []);
  return (
    <LiquidSurface
      value={device}
      color="var(--color-bar-ink)"
      className="border-bar-line flex gap-1 rounded-lg border p-1"
      aria-label="Preview device"
    >
      {(["desktop", "tablet", "phone"] as const).map((d) => (
        <button
          key={d}
          disabled={!ready}
          aria-pressed={device === d}
          onClick={() => setDevice(d)}
          className={cn(
            "min-h-11 rounded-md px-3 text-[13px] capitalize",
            device === d
              ? "bg-bar-ink text-bar font-semibold"
              : "text-bar-muted",
          )}
        >
          {d[0].toUpperCase() + d.slice(1)}
        </button>
      ))}
    </LiquidSurface>
  );
}
