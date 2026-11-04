import { useState } from "react";
import Filter from "@/components/ui/Filter";
import Input from "@/components/ui/FormInput";
import { NewsletterSchema } from "@/lib/schemas/forms";
const articles = [
  {
    title: "The art of doing a little less",
    topic: "Living",
    text: "An invitation to reclaim your weekend, one unhurried morning at a time.",
  },
  {
    title: "A slower route through Baguio",
    topic: "Travel",
    text: "Pine-scented walks, neighborhood cafés, and the joy of taking the long way.",
  },
  {
    title: "Inside a ceramicist’s daily practice",
    topic: "Culture",
    text: "Maya Santos on clay, patience, and finding beauty in the imperfect.",
  },
];
export default function Journal() {
  const [topic, setTopic] = useState("All");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return (
    <>
      <h2 className="mb-6 font-serif text-3xl">Notes from the journal</h2>
      <Filter
        values={["All", "Living", "Travel", "Culture"]}
        value={topic}
        onChange={setTopic}
      />
      <div className="space-y-6">
        {articles
          .filter((a) => topic === "All" || a.topic === topic)
          .map((a) => (
            <article key={a.title} className="border-b border-current/20 pb-6">
              <span className="text-xs tracking-widest uppercase">
                {a.topic} · 5 MIN READ
              </span>
              <h3 className="mt-3 font-serif text-2xl">{a.title}</h3>
              <p className="mt-3 text-sm leading-7">{a.text}</p>
            </article>
          ))}
      </div>
      <form
        noValidate
        className="bg-t-accent/10 mt-10 rounded-xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const p = NewsletterSchema.safeParse(
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          setError(p.success ? "" : p.error.issues[0].message);
          setMessage(
            p.success
              ? "You’re on the demo list! No email was sent or stored."
              : "",
          );
        }}
      >
        <h2 className="mb-4 font-serif text-2xl">A good read, every Sunday.</h2>
        <Input
          label="Your email address"
          id="email"
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
          error={error}
        />
        <button className="bg-t-accent mt-4 min-h-11 rounded px-6 text-white">
          Join the newsletter
        </button>
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      </form>
    </>
  );
}
