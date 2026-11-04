import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { hydratePreview, usePreviewStore } from "@/stores/preview";
import { safeUrl } from "@/lib/security";
export default function DevicePreview({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const device = usePreviewStore((s) => s.device);
  const frame = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    const finish = () => {
      if (mounted) setReady(true);
    };
    hydratePreview().then(finish).catch(finish);
    return () => {
      mounted = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (!ready) return;
    const element = frame.current;
    if (!element) return;
    const width =
      device === "phone" ? "360px" : device === "tablet" ? "640px" : "100%";
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tween: gsap.core.Tween | undefined;
    const resize = () => {
      tween?.kill();
      if (preference.matches || !initialized.current) {
        initialized.current = true;
        element.style.width = width;
        return;
      }
      const currentWidth = element.getBoundingClientRect().width;
      tween = gsap.fromTo(
        element,
        { width: currentWidth },
        { width, duration: 0.6, ease: "power3.inOut", overwrite: true },
      );
    };
    resize();
    preference.addEventListener("change", resize);
    return () => {
      tween?.kill();
      preference.removeEventListener("change", resize);
    };
  }, [device, ready]);
  return (
    <section aria-label="Live template preview" className="min-w-0">
      <div
        ref={frame}
        className="device-frame border-hub-line bg-hub-surface mx-auto max-w-full overflow-hidden rounded-xl border shadow-xl"
      >
        <div className="border-hub-line bg-hub-panel flex min-h-12 items-center gap-1.5 border-b px-3">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="bg-hub-muted/40 size-2 shrink-0 rounded-full"
            />
          ))}
          <span className="text-hub-muted ml-2 min-w-0 flex-1 truncate font-mono text-[10px]">
            /demos/{slug}/
          </span>
          <a
            className="text-hub-muted ml-auto flex min-h-11 shrink-0 items-center text-xs"
            href={safeUrl(`/demos/${slug}/`)}
          >
            Open demo ↗
          </a>
        </div>
        <iframe
          title={`${name} interactive demo`}
          src={safeUrl(`/demos/${slug}/`)}
          className="block h-[760px] w-full border-0"
        />
      </div>
    </section>
  );
}
