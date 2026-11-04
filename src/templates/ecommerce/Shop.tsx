import { useEffect, useState } from "react";
import { useCartStore, selectCartCount } from "@/stores/cart";
import { money } from "@/lib/format";
import Filter from "@/components/ui/Filter";
import { products } from "./data";
export default function Shop() {
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("All");
  const [message, setMessage] = useState("");
  const count = useCartStore(selectCartCount);
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  useEffect(() => {
    Promise.resolve(useCartStore.persist.rehydrate())
      .finally(() => setReady(true))
      .catch(() => setReady(true));
  }, []);
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl">The everyday collection</h2>
        <a className="flex min-h-11 items-center text-sm" href="#cart">
          Bag ({count})
        </a>
      </div>
      <Filter
        values={["All", "Home", "Accessories"]}
        value={category}
        onChange={setCategory}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {products
          .filter((p) => category === "All" || p.category === category)
          .map((p) => (
            <article key={p.id}>
              <div
                className="bg-t-accent/10 text-t-accent flex h-40 items-center justify-center rounded-lg font-serif text-8xl"
                aria-hidden="true"
              >
                {p.symbol}
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <h3>{p.name}</h3>
                <span className="text-sm">{money(p.price)}</span>
              </div>
              <button
                className="mt-3 min-h-11 w-full rounded border border-current/30 text-sm"
                disabled={!ready}
                onClick={() => {
                  add(p.id);
                  setMessage(`${p.name} added to your bag.`);
                }}
              >
                Add to cart
              </button>
            </article>
          ))}
      </div>
      <p role="status" className="mt-4 text-sm">
        {message}
      </p>
      <section id="cart" className="mt-10 border-t border-current/20 pt-7">
        <h2 className="font-serif text-2xl">Your bag · {count}</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm">
            Your bag is waiting for something thoughtful.
          </p>
        ) : (
          items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 border-b border-current/10 py-3"
            >
              <span>
                {products.find((p) => p.id === i.id)?.name || "Item"} × {i.qty}
              </span>
              <button
                className="min-h-11 text-sm underline"
                onClick={() => remove(i.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
        <p className="mt-4 text-xs">
          Demo only. No checkout or payments are collected.
        </p>
      </section>
    </>
  );
}
