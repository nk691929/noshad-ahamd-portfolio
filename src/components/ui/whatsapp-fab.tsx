/**
 * Purpose: floating "WhatsApp" button (bottom right) that opens a pre-filled chat with the NexyMark line.
 * Pulse ring is CSS (transform/opacity) and disabled under reduced motion. Server component.
 * Inputs: content/contact.ts. Used by: src/app/page.tsx.
 */
import { toInternational, whatsappUrl } from "@/lib/phone";
import { contactContent } from "@content/contact";
import "@/styles/whatsapp.css";

export function WhatsAppFab() {
  const { phone, countryCode, whatsappGreeting } = contactContent;
  const international = toInternational(phone, countryCode);
  return (
    <a
      href={whatsappUrl(international, whatsappGreeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in a new tab)"
      className="fab-pulse fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-fg px-5 font-medium text-bg shadow-glow transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 motion-reduce:transition-none"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
