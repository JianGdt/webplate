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
import { useCrmStore, stages } from "./store";
import ContactForm from "./ContactForm";
import { money } from "@/lib/format";
export default function Dashboard() {
  const [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [showForm, setShowForm] = useState(false),
    [message, setMessage] = useState("");
  const contacts = useCrmStore((s) => s.contacts),
    move = useCrmStore((s) => s.move);
  const won = contacts.filter((c) => c.stage === "Won"),
    open = contacts.filter((c) => c.stage !== "Won");
  const visible = contacts.filter((c) =>
    `${c.name} ${c.company} ${c.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function update(id: number, stage: string) {
    move(id, stage);
    setMessage(`Opportunity moved to ${stage}.`);
  }
  return (
    <Shell
      slug="crm"
      title="Relationships"
      description="Know your people. Turn conversations into lasting partnerships."
      tabs={["Overview", "Pipeline", "Contacts"]}
      tab={tab}
      onTab={setTab}
    >
      <Stats
        items={[
          {
            label: "Total contacts",
            value: contacts.length,
            note: "People in your workspace",
          },
          {
            label: "Open pipeline",
            value: money(open.reduce((s, c) => s + c.value, 0)),
            note: `${open.length} active opportunities`,
          },
          {
            label: "Won revenue",
            value: money(won.reduce((s, c) => s + c.value, 0)),
            note: `${won.length} successful partnerships`,
          },
          {
            label: "Win rate",
            value: `${Math.round((won.length / Math.max(contacts.length, 1)) * 100)}%`,
            note: "Won / all opportunities",
          },
        ]}
      />
      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-6 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel title="Pipeline value" detail="Live opportunity totals">
            <Chart
              type="bar"
              title="Value by stage in pesos"
              values={stages.map((stage) =>
                contacts
                  .filter((c) => c.stage === stage)
                  .reduce((s, c) => s + c.value, 0),
              )}
              labels={[...stages]}
              suffix=" PHP"
            />
          </Panel>
          <Panel title="Next conversations" detail="Open opportunities">
            <ul className="[&>li]:border-border [&_small]:text-muted-foreground grid gap-5 [&_small]:mt-1 [&_small]:block [&>li]:border-b [&>li]:pb-4">
              {open.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>
                  <small>
                    {c.company} · {c.stage}
                  </small>
                  <Button
                    className="text-primary hover:bg-accent min-h-11 bg-transparent px-2"
                    onClick={() => {
                      setTab("Pipeline");
                      setQuery(c.company);
                    }}
                  >
                    Review opportunity →
                  </Button>
                </li>
              ))}
            </ul>
            {open.length === 0 && (
              <p>
                All opportunities are won. Add a contact to start a new
                conversation.
              </p>
            )}
          </Panel>
        </div>
      )}
      <div className="mb-5 flex flex-wrap items-end gap-3 [&>label:first-child]:flex-[1_1_180px]">
        <Label className="grid gap-2 text-xs font-medium">
          Search contacts
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, company, or email…"
          />
        </Label>
        <Button className="min-h-11 px-4" onClick={() => setShowForm(true)}>
          Add contact
        </Button>
      </div>
      <p className="text-primary mt-2 mb-4 min-h-6" role="status">
        {message}
      </p>
      {showForm && (
        <ContactForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setMessage("Contact added in this demo session.");
          }}
        />
      )}
      {tab === "Pipeline" ? (
        <Panel title="Deal pipeline" detail="Change the stage to move a deal">
          <div className="grid grid-cols-1 gap-4 min-[1101px]:grid-cols-3">
            {stages.map((stage) => (
              <section
                className="bg-background rounded-lg p-3 [&>h3]:mb-4 [&>h3]:font-semibold"
                key={stage}
              >
                <h3>
                  {stage} · {visible.filter((c) => c.stage === stage).length}
                </h3>
                {visible
                  .filter((c) => c.stage === stage)
                  .map((c) => (
                    <article
                      className="border-border bg-card [&>p]:text-muted-foreground mb-3 rounded-lg border p-4 [&>p]:my-2 [&>p]:text-xs [&>strong]:mb-4 [&>strong]:block"
                      key={c.id}
                    >
                      <h3>{c.company}</h3>
                      <p>{c.name}</p>
                      <strong>{money(c.value)}</strong>
                      <Label className="grid gap-2 text-xs font-medium">
                        Deal stage for {c.company}
                        <NativeSelect
                          value={c.stage}
                          onChange={(e) => update(c.id, e.target.value)}
                        >
                          {stages.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </NativeSelect>
                      </Label>
                    </article>
                  ))}
              </section>
            ))}
          </div>
          {visible.length === 0 && <Empty />}
        </Panel>
      ) : (
        <Panel title="Contact directory" detail={`${visible.length} contacts`}>
          {visible.length === 0 ? (
            <Empty />
          ) : (
            <div className="min-w-0">
              <Table className="[&_th]:bg-background [&_td_small]:text-muted-foreground text-xs [&_select]:min-w-[110px] [&_td_small]:block">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Contact</TableHead>
                    <TableHead scope="col">Company</TableHead>
                    <TableHead scope="col">Deal value</TableHead>
                    <TableHead scope="col">Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <strong>{c.name}</strong>
                        <small>{c.email}</small>
                      </TableCell>
                      <TableCell>{c.company}</TableCell>
                      <TableCell>{money(c.value)}</TableCell>
                      <TableCell>
                        <Badge>{c.stage}</Badge>
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
