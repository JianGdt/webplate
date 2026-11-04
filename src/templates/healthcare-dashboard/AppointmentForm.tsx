import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Panel } from "@/components/dashboard/Widgets";
import { AppointmentSchema, departments, useClinicStore } from "./store";
export default function AppointmentForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const add = useClinicStore((s) => s.add);
  return (
    <Panel
      title="Schedule an appointment"
      detail="Use fictional information only"
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const error = add(Object.fromEntries(new FormData(e.currentTarget)));
          if (error) setError(error);
          else onSaved();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Label className="grid gap-2 text-xs font-medium">
            Patient display name
            <Input
              name="patient"
              maxLength={80}
              placeholder="Patient E"
              required
            />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Department
            <NativeSelect name="department">
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </NativeSelect>
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Appointment date
            <Input type="date" name="date" defaultValue="2026-11-04" required />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Appointment time
            <NativeSelect name="time">
              {AppointmentSchema.shape.time.options.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </NativeSelect>
          </Label>
        </div>
        {error && (
          <p
            role="alert"
            className="border-destructive text-destructive rounded-lg border p-3"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="min-h-11 px-4">
            Save appointment
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
