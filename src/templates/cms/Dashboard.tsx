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
import { useContentStore, type Article } from "./store";
import Editor from "./Editor";
export default function Dashboard() {
  const [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [period, setPeriod] = useState("7 days"),
    [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const articles = useContentStore((s) => s.articles),
    publish = useContentStore((s) => s.publish);
  const published = articles.filter((a) => a.status === "Published").length;
  const visible = articles.filter(
    (a) =>
      (filter === "All" || a.status === filter) &&
      a.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Shell
      slug="cms"
      title="Content studio"
      description="Good stories start here. Keep your content moving."
      tabs={["Overview", "Articles"]}
      tab={tab}
      onTab={setTab}
    >
      <Stats
        items={[
          {
            label: "Total articles",
            value: articles.length,
            note: "Your editorial library",
          },
          { label: "Published", value: published, note: "Ready for readers" },
          {
            label: "In draft",
            value: articles.length - published,
            note: "Ideas in progress",
          },
          {
            label: "Article views",
            value: articles.reduce((s, a) => s + a.views, 0).toLocaleString(),
            note: "Sample lifetime readership",
          },
        ]}
      />
      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel title="Audience overview" detail="Sample traffic">
            <Label className="grid gap-2 text-xs font-medium">
              Reporting period
              <NativeSelect
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>7 days</option>
                <option>30 days</option>
              </NativeSelect>
            </Label>
            <Chart
              title="Article views"
              values={
                period === "7 days"
                  ? [220, 340, 290, 510, 430, 680, 720]
                  : [1240, 1680, 2050, 2360]
              }
              labels={
                period === "7 days"
                  ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                  : ["Week 1", "Week 2", "Week 3", "Week 4"]
              }
            />
          </Panel>
          <Panel title="Editorial snapshot" detail="Live workspace data">
            <Chart
              title="Content by status"
              type="bar"
              values={[articles.length - published, published]}
              labels={["Draft", "Published"]}
            />
            <p>Turn your next idea into a story worth sharing.</p>
            <Button
              className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
              onClick={() => {
                setTab("Articles");
                setEditing("new");
              }}
            >
              Write a new article →
            </Button>
          </Panel>
        </div>
      )}
      <p role="status" className="text-primary mt-2 mb-4 min-h-6">
        {message}
      </p>
      {editing && (
        <Editor
          key={editing === "new" ? "new" : editing.id}
          article={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMessage("Article saved in this demo session.");
          }}
        />
      )}
      <Panel title="Content library" detail={`${visible.length} articles`}>
        <div className="mb-5 flex flex-wrap items-end gap-3 [&>label:first-child]:flex-[1_1_180px]">
          <Label className="grid gap-2 text-xs font-medium">
            Search articles
            <Input
              type="search"
              placeholder="Search by title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Filter status
            <NativeSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Draft</option>
              <option>Published</option>
            </NativeSelect>
          </Label>
          <Button className="min-h-11 px-4" onClick={() => setEditing("new")}>
            New article
          </Button>
        </div>
        {visible.length === 0 ? (
          <Empty />
        ) : (
          <div className="min-w-0">
            <Table className="[&_th]:bg-background [&_td_small]:text-muted-foreground text-xs [&_select]:min-w-[110px] [&_td_small]:block">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Article</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Views</TableHead>
                  <TableHead scope="col">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <strong>{a.title}</strong>
                      <small>{a.category}</small>
                    </TableCell>
                    <TableCell>
                      <Badge>{a.status}</Badge>
                    </TableCell>
                    <TableCell>{a.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
                        aria-label={`Edit ${a.title}`}
                        onClick={() => setEditing(a)}
                      >
                        Edit
                      </Button>
                      {a.status === "Draft" && (
                        <Button
                          className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
                          aria-label={`Publish ${a.title}`}
                          onClick={() => {
                            publish(a.id);
                            setMessage(`${a.title} published in this demo.`);
                          }}
                        >
                          Publish
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
