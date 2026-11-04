import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
export function useDashboardMotion(key: string) {
  const root = useRef<HTMLDivElement>(null);
  const revealed = useRef(new WeakSet<Element>());
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const fresh = Array.from(
          root.current?.querySelectorAll("[data-reveal]") ?? [],
        ).filter((element) => !revealed.current.has(element));
        fresh.forEach((element) => revealed.current.add(element));
        if (!fresh.length) return;
        gsap.from(fresh, {
          y: 22,
          scale: 0.985,
          duration: 0.55,
          stagger: 0.055,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [key]);
  return root;
}
