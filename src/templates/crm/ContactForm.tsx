import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ContactSchema, useCrmStore } from "./store";
import { Panel } from "@/components/dashboard/Widgets";
export default function ContactForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const add = useCrmStore((s) => s.add);
  return (
    <Panel title="New contact & opportunity">
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = ContactSchema.safeParse(
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
          }
          if (add(parsed.data)) onSaved();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Label className="grid gap-2 text-xs font-medium">
            Contact name
            <Input name="name" maxLength={80} required />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Company
            <Input name="company" maxLength={80} required />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Email address
            <Input type="email" name="email" maxLength={254} required />
          </Label>
          <Label className="grid gap-2 text-xs font-medium">
            Deal value (₱)
            <Input
              type="number"
              name="value"
              min="0"
              max="100000000"
              step="0.01"
              defaultValue="0"
              required
            />
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
            Save contact
          </Button>
          <Button
            className="border-border bg-card text-foreground hover:bg-accent min-h-11 border px-4"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
