import { create } from "zustand";
import { z } from "zod";
export const visitStatuses = [
  "Scheduled",
  "Checked in",
  "Completed",
  "Cancelled",
] as const;
export const departments = ["General care", "Dental", "Wellness"] as const;
export const AppointmentSchema = z
  .object({
    patient: z.string().trim().min(2, "Enter a patient display name.").max(80),
    department: z.enum(departments),
    date: z.iso.date("Choose a valid date."),
    time: z.enum([
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
    ]),
  })
  .strict();
export type Appointment = z.infer<typeof AppointmentSchema> & {
  id: number;
  status: (typeof visitStatuses)[number];
};
export const useClinicStore = create<{
  appointments: Appointment[];
  add: (data: unknown) => string;
  update: (id: number, status: unknown) => string;
}>((set, get) => ({
  appointments: [
    {
      id: 1,
      patient: "Patient A",
      department: "General care",
      date: "2026-11-04",
      time: "08:00",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Patient B",
      department: "Dental",
      date: "2026-11-04",
      time: "09:00",
      status: "Checked in",
    },
    {
      id: 3,
      patient: "Patient C",
      department: "Wellness",
      date: "2026-11-04",
      time: "10:00",
      status: "Scheduled",
    },
    {
      id: 4,
      patient: "Patient D",
      department: "General care",
      date: "2026-11-04",
      time: "11:00",
      status: "Scheduled",
    },
  ],
  add: (data) => {
    const result = AppointmentSchema.safeParse(data);
    if (!result.success) return result.error.issues[0].message;
    const value = result.data;
    if (
      get().appointments.some(
        (a) =>
          a.department === value.department &&
          a.date === value.date &&
          a.time === value.time &&
          a.status !== "Cancelled",
      )
    )
      return "That department already has an appointment at this time. Choose another slot.";
    set((s) => ({
      appointments: [
        ...s.appointments,
        {
          ...value,
          id: Math.max(0, ...s.appointments.map((a) => a.id)) + 1,
          status: "Scheduled",
        },
      ],
    }));
    return "";
  },
  update: (id, value) => {
    const result = z.enum(visitStatuses).safeParse(value);
    if (!result.success) return "Choose a valid visit status.";
    const appointment = get().appointments.find((a) => a.id === id);
    if (!appointment) return "Appointment not found.";
    if (
      result.data !== "Cancelled" &&
      get().appointments.some(
        (a) =>
          a.id !== id &&
          a.department === appointment.department &&
          a.date === appointment.date &&
          a.time === appointment.time &&
          a.status !== "Cancelled",
      )
    )
      return "This slot has been rebooked. Keep this appointment cancelled.";
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: result.data } : a,
      ),
    }));
    return "";
  },
}));
