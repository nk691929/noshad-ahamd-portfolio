/**
 * Purpose: contact schema accepts valid input, allows empty optional fields, and rejects values the form never offered.
 */
import { describe, expect, it } from "vitest";
import { createContactSchema } from "@/lib/contact";

const options = {
  projectTypes: ["Website", "Mobile app"],
  budgets: ["Under $500", "I will decide later"],
  timelines: ["Flexible", "Within a month"],
};
const schema = createContactSchema(options);
const ok = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "",
  projectType: "Website",
  budget: "I will decide later",
  timeline: "",
  message: "Hello, I have a project.",
};

describe("contactSchema", () => {
  it("accepts valid input, with optional phone and timeline empty", () => {
    expect(schema.safeParse(ok).success).toBe(true);
  });

  it("accepts a phone number and a timeline", () => {
    expect(
      schema.safeParse({ ...ok, phone: "+92 300 1234567", timeline: "Flexible" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email, short name or short message", () => {
    expect(schema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
    expect(schema.safeParse({ ...ok, name: "A" }).success).toBe(false);
    expect(schema.safeParse({ ...ok, message: "short" }).success).toBe(false);
  });

  it("rejects choices that were never offered", () => {
    expect(schema.safeParse({ ...ok, projectType: "Spaceship" }).success).toBe(false);
    expect(schema.safeParse({ ...ok, budget: "$1" }).success).toBe(false);
    expect(schema.safeParse({ ...ok, timeline: "Yesterday" }).success).toBe(false);
  });

  it("rejects a malformed phone number", () => {
    expect(schema.safeParse({ ...ok, phone: "abc" }).success).toBe(false);
  });
});
