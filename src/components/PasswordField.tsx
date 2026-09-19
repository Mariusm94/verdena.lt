"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function PasswordField({
  name,
  label,
  autoComplete,
  required = true,
  minLength,
}: {
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const input = inputRef.current;
    if (!button || !input) return;

    const sync = (next: boolean) => {
      input.type = next ? "text" : "password";
      button.textContent = next ? "Slėpti" : "Rodyti";
      button.setAttribute("aria-pressed", next ? "true" : "false");
      button.setAttribute("aria-label", next ? "Slėpti slaptažodį" : "Rodyti slaptažodį");
    };

    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const next = input.type === "password";
      setVisible(next);
      sync(next);
    };

    button.addEventListener("click", onClick);
    return () => button.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="grid gap-2 text-sm font-medium">
      <label htmlFor={inputId}>{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          required={required}
          minLength={minLength}
          type={visible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-line px-4 py-3 pr-24"
        />
        <button
          ref={buttonRef}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-court hover:bg-court/10"
          aria-pressed={visible}
          aria-controls={inputId}
          aria-label={visible ? "Slėpti slaptažodį" : "Rodyti slaptažodį"}
        >
          {visible ? "Slėpti" : "Rodyti"}
        </button>
      </div>
    </div>
  );
}
