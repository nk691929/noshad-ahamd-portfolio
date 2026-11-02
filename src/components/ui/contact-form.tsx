"use client";

/**
 * Purpose: validated project-inquiry form wired to the submitContact server action (React 19 useActionState).
 * Fields help assess the project: what is needed (website/app), budget (or "decide later"), timeline, message.
 * Also offers "Send on WhatsApp", which opens a pre-filled chat with the same details.
 * Inputs: options (from content/contact.ts), WhatsApp number in international digits, greeting. No content imports.
 * Used by: sections/contact.tsx.
 */
import { useActionState, useRef } from "react";
import { submitContact } from "@/app/actions/contact";
import { buttonClasses } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import type { ContactContent } from "@/lib/content/contact-schema";
import { buildInquiryText, type ContactField, type ContactState } from "@/lib/inquiry";
import { whatsappUrl } from "@/lib/phone";

const initial: ContactState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-border bg-bg-elevated px-4 py-3 text-fg placeholder:text-fg-muted aria-[invalid=true]:border-accent";

type Props = { options: ContactContent["options"]; whatsappDigits: string; greeting: string };

export function ContactForm({ options, whatsappDigits, greeting }: Props) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);

  function sendWhatsApp() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const get = (key: ContactField) => String(data.get(key) ?? "");
    const text = buildInquiryText(
      {
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        projectType: get("projectType"),
        budget: get("budget"),
        timeline: get("timeline"),
        message: get("message"),
      },
      greeting,
    );
    window.open(whatsappUrl(whatsappDigits, text), "_blank", "noopener,noreferrer");
  }

  function field(
    name: ContactField,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    required = true,
  ) {
    const error = state.fieldErrors?.[name];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm text-fg-muted">
          {label}
          {required ? "" : " (optional)"}
        </label>
        <input
          id={name}
          name={name}
          required={required}
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
    <form
      ref={formRef}
      action={action}
      className="glass relative flex flex-col gap-6 rounded-lg p-6 md:p-8"
      noValidate
    >
      <span className="ring" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", minLength: 2, maxLength: 80 })}
        {field("email", "Email", { type: "email", autoComplete: "email", maxLength: 120 })}
      </div>
      {field(
        "phone",
        "Phone or WhatsApp",
        { type: "tel", autoComplete: "tel", maxLength: 30 },
        false,
      )}
      <ChoiceGroup
        name="projectType"
        legend="What do you need?"
        options={options.projectTypes}
        defaultValue={state.values?.projectType}
        error={state.fieldErrors?.projectType}
      />
      <ChoiceGroup
        name="budget"
        legend="Budget"
        options={options.budgets}
        defaultValue={state.values?.budget}
        error={state.fieldErrors?.budget}
      />
      <ChoiceGroup
        name="timeline"
        legend="Timeline"
        options={options.timelines}
        defaultValue={state.values?.timeline}
        error={state.fieldErrors?.timeline}
        optional
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm text-fg-muted">
          Tell me about your project
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
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
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary", "disabled:opacity-60")}
        >
          {pending ? "Sending..." : "Send message"}
        </button>
        <button type="button" onClick={sendWhatsApp} className={buttonClasses("secondary")}>
          Send on WhatsApp
        </button>
      </div>
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
