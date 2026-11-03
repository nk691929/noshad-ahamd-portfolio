/**
 * Purpose: validate environment variables once. Empty strings count as unset. Never import in client code.
 * Used by: src/instrumentation.ts (fails fast at startup), contact action, GitHub loader.
 */
import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  RESEND_API_KEY: optional(z.string().min(1)),
  CONTACT_TO_EMAIL: optional(z.string().email()),
  CONTACT_FROM_EMAIL: optional(z.string().min(3)),
  GITHUB_TOKEN: optional(z.string().min(1)),
  NEXT_PUBLIC_SUPABASE_URL: optional(z.string().url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(z.string().min(20)),
  SUPABASE_SECRET_KEY: optional(z.string().min(20)),
  COMMENTS_REQUIRE_APPROVAL: optional(z.enum(["true", "false"])),
  // legacy names, still accepted
  SUPABASE_URL: optional(z.string().url()),
  SUPABASE_ANON_KEY: optional(z.string().min(20)),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment variables: ${details}`);
  }
  cached = result.data;
  return cached;
}
