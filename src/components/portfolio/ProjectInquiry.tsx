import { useEffect, useState } from "react";
import { z } from "zod";
import {
  InquirySchema,
  services,
  budgets,
  timelines,
  inquiryText,
} from "@/lib/schemas/inquiry";
import InquiryReview from "./InquiryReview";
import "./inquiry.css";
type TemplateOption = { slug: string; name: string; category: string };
export default function ProjectInquiry({
  templates,
}: {
  templates: TemplateOption[];
}) {
  const [ready, setReady] = useState(false),
    [template, setTemplate] = useState(""),
    [service, setService] = useState<string>(services[0]);
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [brief, setBrief] = useState("");
  useEffect(() => {
    const raw = new URLSearchParams(location.search).get("template");
    const parsed = z
      .enum(templates.map((t) => t.slug) as [string, ...string[]])
      .safeParse(raw);
    if (parsed.success) {
      const selected = templates.find((t) => t.slug === parsed.data);
      setTemplate(parsed.data);
      setService(selected?.category === "systems" ? services[2] : services[3]);
    }
    setReady(true);
  }, [templates]);
  return (
    <div className="inquiry">
      <form
        noValidate
        onChange={() => {
          setBrief("");
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          const selected = templates.find((t) => t.slug === data.template);
          const result = InquirySchema.safeParse({
            ...data,
            template: selected?.name ?? "",
          });
          if (!result.success) {
            setErrors(
              Object.fromEntries(
                result.error.issues.map((i) => [String(i.path[0]), i.message]),
              ),
            );
            return;
          }
          setErrors({});
          setBrief(inquiryText(result.data));
        }}
      >
        <fieldset disabled={!ready} className="grid min-w-0 gap-6 border-0 p-0">
          <div>
            <label htmlFor="inquiry-name">Your name or business</label>
            <input
              id="inquiry-name"
              name="name"
              maxLength={100}
              autoComplete="organization"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          <div className="grid min-w-0 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="inquiry-service">What can I help with?</label>
              <select
                id="inquiry-service"
                name="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inquiry-template">
                A demo you like (optional)
              </label>
              <select
                id="inquiry-template"
                name="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="">An original idea / not sure yet</option>
                {templates.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="inquiry-description">
              Tell me about your project
            </label>
            <p
              id="description-help"
              className="text-hub-muted mb-2 text-[13px]"
            >
              What does your business do, and what should the website or system
              help you achieve?
            </p>
            <textarea
              id="inquiry-description"
              name="description"
              rows={6}
              maxLength={3000}
              required
              aria-invalid={!!errors.description}
              aria-describedby={`description-help${errors.description ? " description-error" : ""}`}
            />
            {errors.description && (
              <p id="description-error" role="alert">
                {errors.description}
              </p>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="inquiry-budget">Estimated budget</label>
              <select id="inquiry-budget" name="budget">
                {budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inquiry-timeline">Preferred timeline</label>
              <select id="inquiry-timeline" name="timeline">
                {timelines.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-hub-muted text-[13px]">
            These details help start the conversation. Pricing and delivery
            dates are agreed after reviewing the scope.
          </p>
          <button className="bg-hub-accent text-hub-accent-ink min-h-11 justify-self-start rounded-lg px-5 py-3 font-semibold">
            Prepare project brief
          </button>
        </fieldset>
      </form>
      {brief && <InquiryReview brief={brief} />}
    </div>
  );
}
