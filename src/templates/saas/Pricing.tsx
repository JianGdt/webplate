import LiquidSurface from "@/components/ui/LiquidSurface";
import { useState } from "react";
import { money } from "@/lib/format";
export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <div className="text-center">
        <h2 className="text-4xl font-semibold tracking-tight">
          Room for your next big idea.
        </h2>
        <p className="mt-4 text-sm">
          Simple plans. A little less admin. A lot more progress.
        </p>
        <LiquidSurface
          value={String(yearly)}
          className="my-7 inline-flex gap-1 rounded-full border border-current/20 p-1"
        >
          {[false, true].map((v) => (
            <button
              key={String(v)}
              aria-pressed={yearly === v}
              onClick={() => setYearly(v)}
              className={`min-h-11 rounded-full px-5 text-sm ${yearly === v ? "bg-t-accent text-white" : ""}`}
            >
              {v ? "Yearly · save 20%" : "Monthly"}
            </button>
          ))}
        </LiquidSurface>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          {
            name: "Starter",
            price: 490,
            description: "For individuals finding their flow.",
          },
          {
            name: "Team",
            price: 1490,
            description: "For teams making things happen.",
          },
        ].map((p) => (
          <article
            key={p.name}
            className="rounded-2xl border border-current/20 p-7"
          >
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="mt-3 text-sm">{p.description}</p>
            <p className="my-7 text-4xl font-semibold">
              {money(p.price * (yearly ? 0.8 : 1))}
              <span className="text-sm font-normal"> / month</span>
            </p>
            <p className="text-xs">
              {yearly
                ? `${money(p.price * 0.8 * 12)} billed yearly`
                : "Billed monthly"}
            </p>
            <ul className="my-6 space-y-3 text-sm">
              <li>✓ Unlimited projects</li>
              <li>✓ Shared workspace</li>
              <li>✓ Thoughtful support</li>
            </ul>
            <button
              onClick={() =>
                setMessage(
                  `${p.name} selected. This is a demo; no account or payment was created.`,
                )
              }
              className="bg-t-accent min-h-11 w-full rounded-lg px-4 text-white"
            >
              Choose {p.name}
            </button>
          </article>
        ))}
      </div>
      <p role="status" className="mt-5 text-sm">
        {message}
      </p>
    </>
  );
}
