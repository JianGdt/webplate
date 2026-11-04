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
import { Panel, Stats, Chart, Empty } from "@/components/dashboard/Widgets";
import { departments, visitStatuses, useClinicStore } from "./store";
import AppointmentForm from "./AppointmentForm";
export default function Dashboard() {
  const [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [period, setPeriod] = useState("This week"),
    [form, setForm] = useState(false),
    [message, setMessage] = useState("");
  const appointments = useClinicStore((s) => s.appointments),
    update = useClinicStore((s) => s.update);
  const visible = appointments.filter(
    (a) =>
      (filter === "All" || a.status === filter) &&
      `${a.patient} ${a.department}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Shell
      slug="healthcare-dashboard"
      title="Care Desk"
      description="A clear view of appointments, clinic activity, and the day ahead."
      tabs={["Overview", "Appointments", "Analytics"]}
      tab={tab}
      onTab={setTab}
    >
      <Stats
        items={[
          {
            label: "Appointments",
            value: appointments.length,
            note: "In this sample workspace",
          },
          {
            label: "Checked in",
            value: appointments.filter((a) => a.status === "Checked in").length,
            note: "Waiting for their visit",
          },
          {
            label: "Completed",
            value: appointments.filter((a) => a.status === "Completed").length,
            note: "Visits marked complete",
          },
          {
            label: "Scheduled",
            value: appointments.filter((a) => a.status === "Scheduled").length,
            note: "Upcoming sample visits",
          },
        ]}
      />
      {tab !== "Appointments" && (
        <div className="grid grid-cols-1 gap-6 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel
            title="Clinic activity"
            detail="Illustrative historical visits"
          >
            <Label className="grid gap-2 text-xs font-medium">
              Activity period
              <NativeSelect
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>This week</option>
                <option>This month</option>
              </NativeSelect>
            </Label>
            <Chart
              title="Clinic visits"
              values={
                period === "This week"
                  ? [18, 24, 20, 31, 27, 22, 14]
                  : [96, 118, 132, 145]
              }
              labels={
                period === "This week"
                  ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                  : ["Week 1", "Week 2", "Week 3", "Week 4"]
              }
            />
          </Panel>
          <Panel title="Visits by department" detail="Live workspace counts">
            <Chart
              type="bar"
              title="Department appointments"
              values={departments.map(
                (d) =>
                  appointments.filter(
                    (a) => a.department === d && a.status !== "Cancelled",
                  ).length,
              )}
              labels={[...departments]}
            />
          </Panel>
        </div>
      )}
      <p className="text-primary mt-2 mb-4 min-h-6" role="status">
        {message}
      </p>
      {form && (
        <AppointmentForm
          onClose={() => setForm(false)}
          onSaved={() => {
            setForm(false);
            setMessage("Appointment scheduled in this demo session.");
          }}
        />
      )}
      {tab !== "Analytics" && (
        <Panel
          title="Appointment schedule"
          detail={`${visible.length} appointments`}
        >
          <div className="mb-5 flex flex-wrap items-end gap-3 [&>label:first-child]:flex-[1_1_180px]">
            <Label className="grid gap-2 text-xs font-medium">
              Search appointments
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Patient or department…"
              />
            </Label>
            <Label className="grid gap-2 text-xs font-medium">
              Appointment status
              <NativeSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                {visitStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </NativeSelect>
            </Label>
            <Button className="min-h-11 px-4" onClick={() => setForm(true)}>
              New appointment
            </Button>
          </div>
          {visible.length === 0 ? (
            <Empty />
          ) : (
            <div className="min-w-0">
              <Table className="[&_th]:bg-background [&_td_small]:text-muted-foreground text-xs [&_select]:min-w-[110px] [&_td_small]:block">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Patient</TableHead>
                    <TableHead scope="col">Department</TableHead>
                    <TableHead scope="col">Date & time</TableHead>
                    <TableHead scope="col">Visit status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <strong>{a.patient}</strong>
                        <small>
                          Demo record #{String(a.id).padStart(3, "0")}
                        </small>
                      </TableCell>
                      <TableCell>{a.department}</TableCell>
                      <TableCell>
                        {a.date}
                        <small>{a.time}</small>
                      </TableCell>
                      <TableCell>
                        <NativeSelect
                          aria-label={`Visit status for ${a.patient}`}
                          value={a.status}
                          onChange={(e) => {
                            const error = update(a.id, e.target.value);
                            setMessage(
                              error || `${a.patient}: ${e.target.value}.`,
                            );
                          }}
                        >
                          {visitStatuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Panel>
      )}
      <p className="text-muted-foreground text-xs">
        Fictional operational data only. This demo does not provide medical
        advice or store patient information.
      </p>
    </Shell>
  );
}
