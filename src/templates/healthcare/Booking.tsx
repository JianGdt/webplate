import { useState } from "react";
import { BookingSchema } from "@/lib/schemas/forms";
import Input from "@/components/ui/FormInput";
export default function Booking() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        const result = BookingSchema.safeParse(data);
        if (!result.success) {
          setErrors(
            Object.fromEntries(
              result.error.issues.map((i) => [i.path[0], i.message]),
            ),
          );
          setMessage("");
          return;
        }
        setErrors({});
        setMessage(
          `Demo appointment confirmed for ${result.data.day} at ${result.data.time}. No information was sent or saved.`,
        );
      }}
      className="grid gap-5"
    >
      <h2 className="font-serif text-3xl">Let's find a time for you.</h2>
      <p className="text-sm">
        Choose a day and an available time, then leave your contact details.
      </p>
      <Input
        id="name"
        name="name"
        label="Full name"
        autoComplete="name"
        maxLength={80}
        error={errors.name}
      />
      <Input
        id="phone"
        name="phone"
        type="tel"
        label="Mobile number"
        placeholder="09171234567"
        autoComplete="tel"
        maxLength={13}
        error={errors.phone}
      />
      <Input
        id="day"
        name="day"
        type="date"
        label="Preferred day"
        error={errors.day}
      />
      <div>
        <label htmlFor="time" className="mb-2 block text-sm">
          Appointment time
        </label>
        <select
          id="time"
          name="time"
          className="bg-t-bg min-h-11 w-full rounded-lg border border-current/30 px-3"
          defaultValue="09:30"
        >
          {BookingSchema.shape.time.options.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm">
          How can we help? (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          maxLength={500}
          className="min-h-24 w-full rounded-lg border border-current/30 p-3"
        />
      </div>
      <button className="bg-t-accent text-t-accent-ink min-h-11 rounded-lg px-6 py-3">
        Confirm appointment
      </button>
      <p role="status" className="text-sm">
        {message}
      </p>
      <p className="text-xs">
        This is a demo booking form, not a medical service.
      </p>
    </form>
  );
}
