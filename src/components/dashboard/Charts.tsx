import { useId, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
export function Chart({
  title,
  values,
  labels,
  suffix = "",
  type = "line",
}: {
  title: string;
  values: number[];
  labels: string[];
  suffix?: string;
  type?: "line" | "bar";
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const data = labels.map((label, i) => ({ label, value: values[i] ?? 0 }));
  const config = {
    value: { label: title, color: "var(--chart-1)" },
  } satisfies ChartConfig;
  const description = `${title}: ${data.map((d) => `${d.label} ${d.value}${suffix}`).join(", ")}`;
  return (
    <div className="min-w-0">
      <div role="img" aria-label={description}>
        <ChartContainer
          config={config}
          className="mt-4 aspect-auto h-[240px] w-full"
          initialDimension={{ width: 320, height: 240 }}
        >
          {type === "bar" ? (
            <BarChart
              data={data}
              accessibilityLayer
              margin={{ left: 8, right: 8, top: 12, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="value" />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
                isAnimationActive={false}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              accessibilityLayer
              margin={{ left: 8, right: 8, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="value" />} />
              <Area
                dataKey="value"
                type="monotone"
                fill={`url(#fill-${id})`}
                stroke="var(--color-value)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {data.map((d, i) => (
          <Button
            key={d.label}
            type="button"
            variant={selected === i ? "secondary" : "ghost"}
            aria-pressed={selected === i}
            className="h-auto min-h-11 min-w-11 flex-1 flex-col gap-0 px-2 text-[11px]"
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
          >
            {d.label}
            <span className="text-muted-foreground text-[10px]">
              {d.value.toLocaleString()}
              {suffix}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-xs" aria-live="polite">
        {selected === null || !data[selected]
          ? "Select a point to inspect its value."
          : `${data[selected].label}: ${data[selected].value.toLocaleString()}${suffix}`}
      </p>
    </div>
  );
}
