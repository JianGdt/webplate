import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/lib/portfolio";
import { safeUrl } from "@/lib/security";
export default function InquiryReview({ brief }: { brief: string }) {
  const [message, setMessage] = useState("");
  const review = useRef<HTMLElement>(null);
  useEffect(() => {
    review.current?.focus();
  }, [brief]);
  const emailHref = safeUrl(
    `mailto:${portfolio.email}?subject=${encodeURIComponent("Project inquiry — Webplate")}&body=${encodeURIComponent(brief)}`,
  );
  return (
    <section
      ref={review}
      tabIndex={-1}
      aria-labelledby="brief-title"
      className="border-hub-line bg-hub-panel mt-9 rounded-xl border p-6"
    >
      <h2 id="brief-title" className="font-display text-2xl font-bold">
        Your brief is ready to review
      </h2>
      <p className="text-hub-muted mt-3 text-sm">
        Nothing has been sent. Open your email app to review and send it to{" "}
        {portfolio.email}, or copy it into your freelance platform conversation.
      </p>
      <label htmlFor="project-brief" className="mt-5">
        Project brief
      </label>
      <textarea id="project-brief" readOnly value={brief} rows={12} />
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={emailHref}
          className="bg-hub-accent text-hub-accent-ink inline-flex min-h-11 items-center rounded-lg px-5 py-3 font-semibold"
        >
          Open email app
        </a>
        <button
          type="button"
          className="border-hub-line min-h-11 rounded-lg border px-5 py-3 font-semibold"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(brief);
              setMessage(
                "Brief copied. Paste it into your email or project conversation.",
              );
            } catch {
              setMessage(
                "Copy is unavailable. Select and copy the text from the project brief above.",
              );
            }
          }}
        >
          Copy brief
        </button>
      </div>
      <p role="status" className="text-hub-muted mt-3 text-sm">
        {message}
      </p>
    </section>
  );
}
