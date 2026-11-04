import { create } from "zustand";
import { z } from "zod";
export const stages = ["New", "Qualified", "Won"] as const;
export const ContactSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a contact name.").max(80),
    company: z.string().trim().min(2, "Enter a company name.").max(80),
    email: z.email("Enter a valid email address.").max(254),
    value: z.coerce
      .number()

      .min(0, "Deal value must be positive.")
      .max(100000000),
  })
  .strict();
export type Contact = z.infer<typeof ContactSchema> & {
  id: number;
  stage: (typeof stages)[number];
};
export const useCrmStore = create<{
  contacts: Contact[];
  add: (data: unknown) => boolean;
  move: (id: number, stage: unknown) => void;
}>((set) => ({
  contacts: [
    {
      id: 1,
      name: "Bea Santos",
      company: "Studio Sari",
      email: "bea@example.com",
      value: 48000,
      stage: "New",
    },
    {
      id: 2,
      name: "Luis Cruz",
      company: "North Collective",
      email: "luis@example.com",
      value: 125000,
      stage: "Qualified",
    },
    {
      id: 3,
      name: "Mia Reyes",
      company: "Isla Coffee",
      email: "mia@example.com",
      value: 36000,
      stage: "Won",
    },
    {
      id: 4,
      name: "Paolo Tan",
      company: "Common Ground",
      email: "paolo@example.com",
      value: 78000,
      stage: "Qualified",
    },
  ],
  add: (data) => {
    const result = ContactSchema.safeParse(data);
    if (!result.success) return false;
    set((s) => ({
      contacts: [
        ...s.contacts,
        {
          ...result.data,
          id: Math.max(0, ...s.contacts.map((c) => c.id)) + 1,
          stage: "New",
        },
      ],
    }));
    return true;
  },
  move: (id, value) => {
    const parsed = z.enum(stages).safeParse(value);
    if (parsed.success)
      set((s) => ({
        contacts: s.contacts.map((c) =>
          c.id === id ? { ...c, stage: parsed.data } : c,
        ),
      }));
  },
}));
