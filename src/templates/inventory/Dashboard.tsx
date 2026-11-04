import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import Shell from "@/components/dashboard/Shell";
import {
  Panel,
  Stats,
  Chart,
  Badge,
  Empty,
} from "@/components/dashboard/Widgets";
import { useInventoryStore, type Product } from "./store";
import InventoryForm from "./Forms";
import Movements from "./Movements";
import { money } from "@/lib/format";
export default function Dashboard() {
  const [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All stock"),
    [editing, setEditing] = useState<Product | "new" | null>(null),
    [message, setMessage] = useState("");
  const products = useInventoryStore((s) => s.products);
  const low = products.filter((p) => p.quantity <= p.minimum),
    units = products.reduce((s, p) => s + p.quantity, 0);
  const visible = products.filter(
    (p) =>
      `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All stock" || p.quantity <= p.minimum),
  );
  return (
    <Shell
      slug="inventory"
      title="Inventory"
      description="The right stock, in the right place. Stay one step ahead."
      tabs={["Overview", "Products", "Movements"]}
      tab={tab}
      onTab={setTab}
    >
      <Stats
        items={[
          {
            label: "Product lines",
            value: products.length,
            note: "Active SKUs",
          },
          {
            label: "Units in stock",
            value: units,
            note: "Available across all products",
          },
          {
            label: "Stock value",
            value: money(
              products.reduce((s, p) => s + p.quantity * p.price, 0),
            ),
            note: "At listed unit price",
          },
          {
            label: "Low-stock items",
            value: low.length,
            note: "At or below reorder threshold",
          },
        ]}
      />
      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel title="Stock by category" detail="Live unit counts">
            <Chart
              title="Available units"
              type="bar"
              labels={["Home", "Apparel", "Accessories"]}
              values={["Home", "Apparel", "Accessories"].map((c) =>
                products
                  .filter((p) => p.category === c)
                  .reduce((s, p) => s + p.quantity, 0),
              )}
            />
          </Panel>
          <Panel title="Needs your attention" detail={`${low.length} products`}>
            <ul className="[&>li]:border-border [&_small]:text-muted-foreground grid gap-5 [&_small]:mt-1 [&_small]:block [&>li]:border-b [&>li]:pb-4">
              {low.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong>
                  <small>
                    {p.quantity} available · Reorder at {p.minimum}
                  </small>
                  <Button
                    className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
                    onClick={() => setEditing(p)}
                  >
                    Receive stock →
                  </Button>
                </li>
              ))}
            </ul>
            {low.length === 0 && (
              <p>All products are above their reorder threshold.</p>
            )}
          </Panel>
        </div>
      )}
      <p role="status" className="text-primary mt-2 mb-4 min-h-6">
        {message}
      </p>
      {editing && (
        <InventoryForm
          key={editing === "new" ? "new" : editing.id}
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMessage("Inventory updated in this demo session.");
          }}
        />
      )}
      {tab === "Movements" ? (
        <Movements />
      ) : (
        <Panel title="Product inventory" detail={`${visible.length} products`}>
          <div className="mb-5 flex flex-wrap items-end gap-3 [&>label:first-child]:flex-[1_1_180px]">
            <Label className="grid gap-2 text-xs font-medium">
              Search products
              <Input
                type="search"
                placeholder="Product name or SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Stock filter
              <NativeSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All stock</option>
                <option>Low stock</option>
              </NativeSelect>
            </Label>
            <Button className="min-h-11 px-4" onClick={() => setEditing("new")}>
              Add product
            </Button>
          </div>
          {visible.length === 0 ? (
            <Empty />
          ) : (
            <div className="min-w-0">
              <Table className="[&_th]:bg-background [&_td_small]:text-muted-foreground text-xs [&_select]:min-w-[110px] [&_td_small]:block">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Product</TableHead>
                    <TableHead scope="col">Category</TableHead>
                    <TableHead scope="col">Unit price</TableHead>
                    <TableHead scope="col">Stock</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <strong>{p.name}</strong>
                        <small>{p.sku}</small>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{money(p.price)}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>
                        <Badge>
                          {p.quantity === 0
                            ? "Out of stock"
                            : p.quantity <= p.minimum
                              ? "Low stock"
                              : "In stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
                          aria-label={`Adjust ${p.name}`}
                          onClick={() => setEditing(p)}
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Panel>
      )}
    </Shell>
  );
}
