/**
 * Purpose: phone/WhatsApp link helpers and the inquiry text builder (uses a fake sample number).
 */
import { describe, expect, it } from "vitest";
import { buildInquiryText } from "@/lib/inquiry";
import { telUrl, toInternational, whatsappUrl } from "@/lib/phone";

describe("phone helpers", () => {
  it("converts a local number to international digits", () => {
    expect(toInternational("03001234567", "92")).toBe("923001234567");
    expect(toInternational("0300 123-4567", "92")).toBe("923001234567");
  });

  it("builds WhatsApp and tel links", () => {
    expect(whatsappUrl("923001234567")).toBe("https://wa.me/923001234567");
    expect(whatsappUrl("923001234567", "Hi there")).toBe(
      "https://wa.me/923001234567?text=Hi%20there",
    );
    expect(telUrl("923001234567")).toBe("tel:+923001234567");
  });
});

describe("buildInquiryText", () => {
  it("skips empty fields", () => {
    const text = buildInquiryText(
      { name: "Ada", projectType: "Website", budget: "", message: "Hello" },
      "Hi",
    );
    expect(text).toContain("Name: Ada");
    expect(text).toContain("Looking for: Website");
    expect(text).not.toContain("Budget");
    expect(text.endsWith("Hello")).toBe(true);
  });
});
