"use client";

/**
 * Purpose: validated contact form wired to the submitContact server action (React 19 useActionState).
 * Server returns field errors, the entered values (React resets uncontrolled forms) and a mailto fallback.
 * Inputs: none. Used by: sections/contact.tsx.
 */
import { useActionState } from "react";
import { submitContact } from "@/app/actions/contact";
import { buttonClasses } from "@/components/ui/button";
import type { ContactField, ContactState } from "@/lib/contact";

const initial: ContactState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-border bg-bg-elevated px-4 py-3 text-fg placeholder:text-fg-muted aria-[invalid=true]:border-accent";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  function field(
    name: ContactField,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) {
    const error = state.fieldErrors?.[name];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm text-fg-muted">
          {label}
        </label>
        <input
          id={name}
          name={name}
          required
          defaultValue={state.values?.[name]}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={inputClass}
          {...props}
        />
        {error ? (
          <p id={`${name}-error`} className="text-sm text-accent">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const messageError = state.fieldErrors?.message;

  return (
    <form action={action} className="glass flex flex-col gap-5 rounded-lg p-6 md:p-8" noValidate>
      {field("name", "Name", { autoComplete: "name", minLength: 2, maxLength: 80 })}
      {field("email", "Email", { type: "email", autoComplete: "email", maxLength: 120 })}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm text-fg-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={2000}
          defaultValue={state.values?.message}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "message-error" : undefined}
          className={inputClass}
        />
        {messageError ? (
          <p id="message-error" className="text-sm text-accent">
            {messageError}
          </p>
        ) : null}
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", "self-start disabled:opacity-60")}
      >
        {pending ? "Sending..." : "Send message"}
      </button>
      <div aria-live="polite" className="min-h-6 text-sm">
        {state.message ? (
          <p className={state.status === "success" ? "text-fg" : "text-fg-muted"}>
            {state.message}
          </p>
        ) : null}
        {state.status === "fallback" && state.mailto ? (
          <a href={state.mailto} className={buttonClasses("secondary", "mt-3")}>
            Open email app
          </a>
        ) : null}
      </div>
    </form>
  );
}
