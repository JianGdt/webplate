import { useState } from "react";
import Filter from "@/components/ui/Filter";
const projects = [
  {
    name: "Offscript",
    category: "Branding",
    description: "A new voice for an independent creative studio.",
    style: "bg-t-accent/15 text-t-ink",
  },
  {
    name: "A—form",
    category: "Digital",
    description: "A playful digital home for a furniture collective.",
    style: "bg-violet-800 text-white",
  },
  {
    name: "Common Ground",
    category: "Branding",
    description: "An identity rooted in community and good coffee.",
    style: "bg-orange-100 text-orange-950",
  },
];
export default function Projects() {
  const [filter, setFilter] = useState("All");
  return (
    <>
      <h2 className="mb-6 text-3xl font-medium">Selected work / 2024–2026</h2>
      <Filter
        values={["All", "Branding", "Digital"]}
        value={filter}
        onChange={setFilter}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {projects
          .filter((p) => filter === "All" || p.category === filter)
          .map((p) => (
            <article key={p.name}>
              <div
                className={`flex h-52 items-center justify-center rounded-xl font-serif text-4xl ${p.style}`}
              >
                {p.name}
              </div>
              <h3 className="mt-4 text-xl">{p.name}</h3>
              <p className="mt-2 text-sm">{p.description}</p>
              <p className="mt-3 text-xs tracking-widest uppercase">
                {p.category}
              </p>
            </article>
          ))}
      </div>
    </>
  );
}
