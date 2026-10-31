/**
 * Purpose: Contact section: copy-email button, social links and the validated form.
 * Inputs: content/profile.ts, content/socials.ts, content/sections.ts. Placeholders are hidden.
 */
import { ContactForm } from "@/components/ui/contact-form";
import { CopyEmailButton } from "@/components/ui/copy-email-button";
import { Section } from "@/components/ui/section";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";
import { socials } from "@content/socials";

export function Contact() {
  const copy = sectionsCopy.contact;
  const email = real(profile.email);
  const links = socials.map((s) => ({ ...s, url: real(s.url) })).filter((s) => s.url);

  return (
    <Section id="contact" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          {email ? (
            <div className="flex flex-col items-start gap-3">
              <a href={`mailto:${email}`} className="font-display text-h3 hover:text-accent">
                {email}
              </a>
              <CopyEmailButton email={email} />
            </div>
          ) : null}
          <ul className="flex flex-col gap-2">
            {links.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
