import { type ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
export { Chart } from "./Charts";
export function Panel({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  return (
    <Card
      data-reveal
      className="border-border mb-6 gap-5 overflow-visible border py-5 ring-0"
    >
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 px-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {detail && (
          <CardDescription className="text-xs">{detail}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-5">{children}</CardContent>
    </Card>
  );
}
export function Stats({
  items,
}: {
  items: { label: string; value: string | number; note: string }[];
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 min-[1101px]:grid-cols-4">
      {items.map((i) => (
        <Card
          key={i.label}
          className="dash-stat border-border gap-0 border p-5 ring-0"
          data-reveal
        >
          <p className="text-muted-foreground text-xs">{i.label}</p>
          <strong className="my-3 block text-2xl font-semibold tracking-tight min-[1101px]:text-3xl">
            {i.value}
          </strong>
          <small className="text-muted-foreground text-xs">{i.note}</small>
        </Card>
      ))}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <UiBadge variant="secondary">{children}</UiBadge>;
}
export function Empty() {
  return (
    <p className="text-muted-foreground py-9 text-center">
      No matching records. Try another search or filter.
    </p>
  );
}
