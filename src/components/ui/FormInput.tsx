import type { InputHTMLAttributes } from "react";
export default function Input({
  label,
  id,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-11 w-full rounded-lg border border-current/30 bg-transparent px-3 py-2"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
