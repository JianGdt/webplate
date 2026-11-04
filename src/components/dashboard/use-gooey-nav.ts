import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
export function useGooeyNav(value: string, itemKey: string) {
  const root = useRef<HTMLDivElement>(null),
    initialized = useRef(false);
  useLayoutEffect(() => {
    const nav = root.current;
    if (!nav) return;
    const blobs = Array.from(
      nav.querySelectorAll<HTMLElement>("[data-goo-blob]"),
    );
    const active = () =>
      Array.from(
        nav.querySelectorAll<HTMLElement>("button, a[data-liquid-link]"),
      ).find(
        (b) =>
          b.dataset.value === value ||
          b.getAttribute("aria-pressed") === "true" ||
          b.getAttribute("aria-selected") === "true" ||
          b.getAttribute("data-liquid-selected") === "true",
      );
    const animations: gsap.core.Timeline[] = [];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const place = (animate: boolean) => {
      const target = active();
      if (!target) return;
      animations.splice(0).forEach((animation) => animation.kill());
      gsap.killTweensOf(blobs);
      const {
        offsetLeft: x,
        offsetTop: y,
        offsetWidth: width,
        offsetHeight: height,
      } = target;
      blobs.forEach((blob, i) => {
        const scale = i === 0 ? 1 : i === 1 ? 0.72 : 0.32;
        const box = {
          x: x + (width * (1 - scale)) / 2,
          y: y + (height * (1 - scale)) / 2,
          width: width * scale,
          height: height * scale,
          opacity: 1,
        };
        if (!animate || preference.matches || !initialized.current)
          gsap.set(blob, { ...box, scaleX: 1, scaleY: 1 });
        else {
          const horizontal =
            Math.abs(x - Number(gsap.getProperty(blob, "x"))) >
            Math.abs(y - Number(gsap.getProperty(blob, "y")));
          const animation = gsap.timeline({ delay: i * 0.045 });
          animation
            .to(
              blob,
              {
                ...box,
                duration: 0.48 + i * 0.12,
                ease: i === 0 ? "power3.inOut" : "elastic.out(1, 0.7)",
              },
              0,
            )
            .to(
              blob,
              {
                scaleX: horizontal ? 1.16 : 0.9,
                scaleY: horizontal ? 0.9 : 1.16,
                duration: 0.17,
                ease: "power2.out",
              },
              0,
            )
            .to(
              blob,
              {
                scaleX: 1,
                scaleY: 1,
                duration: 0.42,
                ease: "elastic.out(1, 0.5)",
              },
              0.17,
            );
          animations.push(animation);
        }
      });
      initialized.current = true;
      nav.dataset.liquidReady = "true";
    };
    place(true);
    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;
        return;
      }
      place(false);
    });
    observer.observe(nav);
    nav
      .querySelectorAll("button, a[data-liquid-link]")
      .forEach((b) => observer.observe(b));
    const reach = (event: Event) => {
      if (preference.matches) return;
      const target = (event.target as HTMLElement).closest<HTMLElement>(
          "button, a[data-liquid-link]",
        ),
        current = active();
      if (!target || !current || target === current) return;
      const dx = (target.offsetLeft - current.offsetLeft) * 0.26,
        dy = (target.offsetTop - current.offsetTop) * 0.26;
      gsap.to(blobs[2], {
        x: current.offsetLeft + current.offsetWidth * 0.34 + dx,
        y: current.offsetTop + current.offsetHeight * 0.34 + dy,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    };
    const retract = () => place(true),
      changed = () => place(false);
    nav.addEventListener("pointerover", reach);
    nav.addEventListener("focusin", reach);
    nav.addEventListener("pointerleave", retract);
    preference.addEventListener("change", changed);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.kill());
      gsap.killTweensOf(blobs);
      nav.removeEventListener("pointerover", reach);
      nav.removeEventListener("focusin", reach);
      nav.removeEventListener("pointerleave", retract);
      preference.removeEventListener("change", changed);
    };
  }, [value, itemKey]);
  return root;
}
