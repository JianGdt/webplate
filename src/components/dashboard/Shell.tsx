import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LiquidTabs from "./LiquidTabs";
import { useDashboardMotion } from "./use-dashboard-motion";
import "./dashboard.css";
export default function Shell({
  slug,
  title,
  description,
  tabs,
  tab,
  onTab,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  tabs: string[];
  tab: string;
  onTab: (tab: string) => void;
  children: ReactNode;
}) {
  const root = useDashboardMotion(tab);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div
      ref={root}
      className="dashboard bg-background text-foreground min-h-screen font-sans text-sm min-[701px]:flex [&_*]:min-w-0"
    >
      <aside className="dash-rail border-border bg-card flex w-full shrink-0 flex-col border-b p-4 min-[701px]:w-[200px] min-[701px]:border-r min-[701px]:border-b-0 min-[701px]:px-4 min-[701px]:py-7">
        <a
          href="#main"
          className="mb-3 flex min-h-11 items-center gap-3 text-xl font-bold tracking-tight min-[701px]:mb-10"
        >
          <LayoutDashboard
            className="text-primary size-6 shrink-0"
            aria-hidden="true"
          />
          {title}
        </a>
        <p className="text-muted-foreground mb-4 hidden text-[10px] tracking-widest min-[701px]:block">
          YOUR WORKSPACE
        </p>
        <LiquidTabs
          items={tabs}
          value={tab}
          onChange={onTab}
          disabled={!ready}
          label={`${title} sections`}
        />
        <div className="mt-auto hidden items-center gap-3 pt-16 min-[701px]:flex">
          <span className="bg-accent text-primary grid size-9 shrink-0 place-items-center rounded-full text-xs">
            {title
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
          <div>
            <strong>{title}</strong>
            <small className="text-muted-foreground block">
              Demo workspace
            </small>
          </div>
        </div>
      </aside>
      <div className="flex-1">
        <header className="border-border bg-card text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-xs md:px-8">
          <span>
            {title}{" "}
            <span className="mx-3" aria-hidden="true">
              /
            </span>
            <strong>{tab}</strong>
          </span>
          <a
            href={`/templates/${slug}/`}
            className="inline-flex min-h-11 items-center gap-2"
          >
            Template details{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 py-7 md:p-8">
          <div
            data-reveal
            className="mb-7 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-muted-foreground mb-4 text-[10px] tracking-widest">
                A LITTLE CLARITY. A LOT OF PROGRESS.
              </p>
              <h1 className="mb-3 text-3xl font-extrabold tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground max-w-[65ch]">
                {description}
              </p>
            </div>
            <Badge variant="secondary">Interactive demo</Badge>
          </div>
          <fieldset disabled={!ready} className="m-0 min-w-0 border-0 p-0">
            {children}
          </fieldset>
          <footer className="text-muted-foreground mt-7 text-xs">
            Sample workspace · Changes last for this session. Nothing is sent or
            saved to a server.
          </footer>
        </div>
      </div>
    </div>
  );
}
