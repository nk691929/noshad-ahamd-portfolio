/**
 * Purpose: pure helpers to turn a local phone number into WhatsApp / tel links. No dependencies (safe in client code).
 * Used by: contact section, contact form, WhatsApp button, tests.
 */

/** "03001234567" + "92" -> "923001234567" (international digits, no plus). */
export function toInternational(phone: string, countryCode: string): string {
  return `${countryCode}${phone.replace(/\D/g, "").replace(/^0+/, "")}`;
}

export function whatsappUrl(international: string, text?: string): string {
  return `https://wa.me/${international}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telUrl(international: string): string {
  return `tel:+${international}`;
}
