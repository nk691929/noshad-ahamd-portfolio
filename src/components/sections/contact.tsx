/**
 * Purpose: Contact section: NexyMark business line (WhatsApp + call), email with copy button, social links and the
 * project-inquiry form. Placeholders are hidden. Inputs: content/contact.ts, content/profile.ts,
 * content/socials.ts, content/sections.ts.
 */
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { CopyEmailButton } from "@/components/ui/copy-email-button";
import { Section } from "@/components/ui/section";
import { real } from "@/lib/content/real";
import { telUrl, toInternational, whatsappUrl } from "@/lib/phone";
import { contactContent } from "@content/contact";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";
import { socials } from "@content/socials";

export function Contact() {
  const copy = sectionsCopy.contact;
  const { business, phone, phoneDisplay, countryCode, whatsappGreeting, options } = contactContent;
  const international = toInternational(phone, countryCode);
  const email = real(profile.email);
  const links = socials.map((s) => ({ ...s, url: real(s.url) })).filter((s) => s.url);

  return (
    <Section id="contact" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            <div className="glass flex flex-col gap-4 rounded-lg p-6">
              <p className="text-fg-muted">{business.line}</p>
              <p className="font-display text-h3">{phoneDisplay}</p>
              <div className="flex flex-wrap gap-3">
                <Button href={whatsappUrl(international, whatsappGreeting)} external>
                  WhatsApp
                </Button>
                <Button href={telUrl(international)} variant="secondary">
                  Call
                </Button>
              </div>
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline-offset-4 hover:underline"
              >
                {business.name}
                <span className="sr-only"> (opens in a new tab)</span>{" "}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
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
          <ContactForm
            options={options}
            whatsappDigits={international}
            greeting={whatsappGreeting}
          />
        </div>
      </Reveal>
    </Section>
  );
}
