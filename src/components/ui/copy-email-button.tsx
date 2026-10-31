"use client";

/**
 * Purpose: copy-to-clipboard button for the public email, with an aria-live confirmation.
 * Inputs: email string. Used by: contact section.
 */
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button type="button" onClick={copy} className={buttonClasses("secondary")}>
      {copied ? "Copied" : "Copy email"}
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </button>
  );
}
