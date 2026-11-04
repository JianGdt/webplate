import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useInventoryStore, type Product } from "./store";
import { Panel } from "@/components/dashboard/Widgets";
export default function InventoryForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const add = useInventoryStore((s) => s.add),
    adjust = useInventoryStore((s) => s.adjust);
  return (
    <Panel
      title={
        product === "new" ? "Add product" : `Adjust stock · ${product.name}`
      }
    >
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          const result =
            product === "new" ? add(data) : adjust({ ...data, id: product.id });
          if (result) setError(result);
          else onSaved();
        }}
      >
        {product === "new" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Label className="grid gap-2 text-xs font-medium">
              Product name
              <Input name="name" maxLength={80} required />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              SKU
              <Input name="sku" maxLength={30} required />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Product category
              <NativeSelect name="category">
                <option>Home</option>
                <option>Apparel</option>
                <option>Accessories</option>
              </NativeSelect>
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Unit price (₱)
              <Input
                type="number"
                name="price"
                min="0"
                max="1000000"
                step="0.01"
                defaultValue="0"
                required
              />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Opening stock
              <Input
                type="number"
                name="quantity"
                min="0"
                max="99999"
                defaultValue="0"
                required
              />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Low-stock threshold
              <Input
                type="number"
                name="minimum"
                min="0"
                max="99999"
                defaultValue="5"
                required
              />
            </Label>
          </div>
        ) : (
          <>
            <p>Available stock: {product.quantity} units</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Label className="grid gap-2 text-xs font-medium">
                Movement type
                <NativeSelect name="kind">
                  <option>Receive</option>
                  <option>Dispatch</option>
                </NativeSelect>
              </Label>
              <Label className="grid gap-2 text-xs font-medium">
                Units
                <Input
                  type="number"
                  name="quantity"
                  min="1"
                  max="99999"
                  defaultValue="1"

                  required
                />
              </Label>
            </div>
          </>
        )}
        {error && (
          <p
            className="border-destructive text-destructive rounded-lg border p-3"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="min-h-11 px-4">
            {product === "new" ? "Save product" : "Confirm adjustment"}
          </Button>
          <Button
            type="button"
            className="border-border bg-card text-foreground hover:bg-accent min-h-11 border px-4"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
