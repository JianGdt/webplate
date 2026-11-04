import LiquidSurface from "@/components/ui/LiquidSurface";
import { useState, useRef } from "react";
import { money } from "@/lib/format";
const menu = {
  Small: [
    ["Roasted squash soup", 220],
    ["Burrata & heirloom tomatoes", 380],
  ],
  Mains: [
    ["Wood-fired chicken inasal", 520],
    ["Wild mushroom risotto", 460],
    ["Catch of the day", 650],
  ],
  Sweet: [
    ["Calamansi tart", 240],
    ["Dark chocolate crémeux", 280],
  ],
} as const;
type Tab = keyof typeof menu;
const tabs = Object.keys(menu) as Tab[];
export default function Menu() {
  const [tab, setTab] = useState<Tab>("Small");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      <h2 className="mb-6 font-serif text-4xl">Made to be shared.</h2>
      <LiquidSurface
        value={tab}
        role="tablist"
        aria-label="Menu courses"
        className="mb-8 flex gap-3"
      >
        {tabs.map((t, i) => (
          <button
            ref={(el) => {
              refs.current[i] = el;
            }}
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-controls={`panel-${t}`}
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(e) => {
              let n = i;
              if (e.key === "ArrowRight") n = (i + 1) % 3;
              else if (e.key === "ArrowLeft") n = (i + 2) % 3;
              else if (e.key === "Home") n = 0;
              else if (e.key === "End") n = 2;
              else return;
              e.preventDefault();
              setTab(tabs[n]);
              refs.current[n]?.focus();
            }}
            className={`min-h-11 rounded-full border border-current/30 px-5 text-sm ${tab === t ? "bg-t-accent text-t-accent-ink" : ""}`}
          >
            {t}
          </button>
        ))}
      </LiquidSurface>
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {menu[tab].map(([name, price]) => (
          <div
            key={name}
            className="flex justify-between gap-4 border-b border-current/20 py-5"
          >
            <h3 className="font-serif text-xl">{name}</h3>
            <span>{money(price)}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs">
        Seasonal ingredients, sourced close to home. Ask our team about
        allergens.
      </p>
    </>
  );
}
