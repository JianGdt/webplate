import { create } from "zustand";
import { z } from "zod";
export const ProductSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a product name.").max(80),
    sku: z
      .string()
      .trim()
      .min(2, "Enter a SKU.")
      .max(30)
      .regex(
        /^[A-Za-z0-9-]+$/,
        "Use letters, numbers, or hyphens for the SKU.",
      ),
    category: z.enum(["Home", "Apparel", "Accessories"]),
    quantity: z.coerce
      .number()
      .int()
      .min(0, "Stock cannot be negative.")
      .max(99999),
    price: z.coerce.number().min(0).max(1000000),
    minimum: z.coerce.number().int().min(0).max(99999),
  })
  .strict();
export const AdjustmentSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    quantity: z.coerce
      .number()
      .int()
      .min(1, "Enter at least 1 unit.")
      .max(99999),
    kind: z.enum(["Receive", "Dispatch"]),
  })
  .strict();
export type Product = z.infer<typeof ProductSchema> & { id: number };
type Movement = { id: number; name: string; kind: string; quantity: number };
export const useInventoryStore = create<{
  products: Product[];
  movements: Movement[];
  add: (data: unknown) => string;
  adjust: (data: unknown) => string;
}>((set, get) => ({
  products: [
    {
      id: 1,
      name: "Linen tote",
      sku: "ACC-001",
      category: "Accessories",
      quantity: 42,
      price: 850,
      minimum: 10,
    },
    {
      id: 2,
      name: "Stoneware cup",
      sku: "HOM-002",
      category: "Home",
      quantity: 8,
      price: 480,
      minimum: 12,
    },
    {
      id: 3,
      name: "Cotton overshirt",
      sku: "APP-003",
      category: "Apparel",
      quantity: 26,
      price: 1800,
      minimum: 8,
    },
    {
      id: 4,
      name: "Studio vase",
      sku: "HOM-004",
      category: "Home",
      quantity: 0,
      price: 1250,
      minimum: 5,
    },
    {
      id: 5,
      name: "Woven throw",
      sku: "HOM-005",
      category: "Home",
      quantity: 18,
      price: 1600,
      minimum: 6,
    },
  ],
  movements: [],
  add: (data) => {
    const p = ProductSchema.safeParse(data);
    if (!p.success) return p.error.issues[0].message;
    if (
      get().products.some(
        (i) => i.sku.toLowerCase() === p.data.sku.toLowerCase(),
      )
    )
      return "This SKU already exists. Use a unique SKU.";
    set((s) => ({
      products: [
        ...s.products,
        { ...p.data, id: Math.max(0, ...s.products.map((i) => i.id)) + 1 },
      ],
    }));
    return "";
  },
  adjust: (data) => {
    const p = AdjustmentSchema.safeParse(data);
    if (!p.success) return p.error.issues[0].message;
    const product = get().products.find((i) => i.id === p.data.id);
    if (!product) return "Choose an existing product.";
    const delta =
      p.data.kind === "Receive" ? p.data.quantity : -p.data.quantity;
    if (product.quantity + delta < 0)
      return "Not enough stock. Reduce the dispatch quantity.";
    if (product.quantity + delta > 99999)
      return "Stock cannot exceed 99,999 units.";
    set((s) => ({
      products: s.products.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + delta } : i,
      ),
      movements: [
        {
          id: s.movements.length + 1,
          name: product.name,
          kind: p.data.kind,
          quantity: p.data.quantity,
        },
        ...s.movements,
      ],
    }));
    return "";
  },
}));
