import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Panel, Badge } from "@/components/dashboard/Widgets";
import { useInventoryStore } from "./store";
export default function Movements() {
  const movements = useInventoryStore((s) => s.movements);
  return (
    <Panel title="Stock movements" detail="This session">
      {movements.length === 0 ? (
        <p className="text-muted-foreground px-3 py-9 text-center">
          No movements yet. Receive or dispatch stock from Products.
        </p>
      ) : (
        <div className="min-w-0">
          <Table className="[&_th]:bg-background [&_td_small]:text-muted-foreground text-xs [&_select]:min-w-[110px] [&_td_small]:block">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Movement</TableHead>
                <TableHead scope="col">Product</TableHead>
                <TableHead scope="col">Type</TableHead>
                <TableHead scope="col">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>#{String(m.id).padStart(3, "0")}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>
                    <Badge>{m.kind}</Badge>
                  </TableCell>
                  <TableCell>
                    {m.kind === "Receive" ? "+" : "−"}
                    {m.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  );
}
