import { z } from "zod";
export const NewsletterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email like name@example.com")),
  })
  .strict();
export const BookingSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    phone: z
      .string()
      .trim()
      .regex(
        /^(\+63|0)9\d{9}$/,
        "Enter a Philippine mobile number, like 09171234567",
      ),
    day: z.iso.date(),
    time: z.enum(["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"]),
    notes: z.string().trim().max(500).optional(),
  })
  .strict();
