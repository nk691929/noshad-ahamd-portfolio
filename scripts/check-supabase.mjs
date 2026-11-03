// Purpose: verify the comments security model against the REAL Supabase project. Nothing here is mocked.
// Run (read-only checks):          node --env-file=.env.local scripts/check-supabase.mjs
// Run with write tests (needs the secret key, creates and deletes one test row):
//                                  node --env-file=.env.local scripts/check-supabase.mjs --write
// Also scans .next/static (after `pnpm build`) for the secret key and service-role markers.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const env = process.env;
const pick = (...v) => v.find((x) => x && x.trim())?.trim();
const url = pick(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL)?.replace(/\/$/, "");
const publicKey = pick(
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  env.SUPABASE_PUBLISHABLE_KEY,
  env.SUPABASE_ANON_KEY,
);
const secretKey = pick(env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY);
const writeTests = process.argv.includes("--write");

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

if (!url || !publicKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the legacy names).",
  );
  process.exit(1);
}

const headersFor = (key) => {
  const h = { apikey: key, "Content-Type": "application/json" };
  if (!key.startsWith("sb_")) h.Authorization = `Bearer ${key}`;
  return h;
};
const rest = (p, key, init = {}) =>
  fetch(`${url}/rest/v1/${p}`, {
    ...init,
    headers: { ...headersFor(key), ...(init.headers ?? {}) },
  });
const denied = (res) => [401, 403, 400, 404, 405].includes(res.status);

// --- the public key must not be a privileged key ---
let role = "publishable";
if (publicKey.startsWith("sb_secret_")) role = "secret";
else if (!publicKey.startsWith("sb_")) {
  try {
    role =
      JSON.parse(Buffer.from(publicKey.split(".")[1] ?? "", "base64url").toString()).role ??
      "unknown";
  } catch {
    role = "unknown";
  }
}
check(
  "public key is not a service/secret key",
  role !== "secret" && role !== "service_role",
  `role: ${role}`,
);

// --- what a public visitor can do ---
const read = await rest(
  "comments?select=id,name,message,created_at&approved=eq.true&order=created_at.desc&limit=5",
  publicKey,
);
check("public visitor can read approved comments", read.status === 200, `HTTP ${read.status}`);

const hidden = await rest("comments?select=id&approved=eq.false&limit=5", publicKey);
const hiddenRows = hidden.ok ? await hidden.json() : null;
check(
  "public visitor cannot see unapproved comments",
  hidden.ok && Array.isArray(hiddenRows) && hiddenRows.length === 0,
  `HTTP ${hidden.status}, rows ${hiddenRows?.length}`,
);

const priv = await rest("comments?select=ip_hash,submission_id&limit=1", publicKey);
check("public visitor cannot read ip_hash / submission_id", denied(priv), `HTTP ${priv.status}`);

const ins = await rest("comments", publicKey, {
  method: "POST",
  body: JSON.stringify({ name: "Check", message: "Should be rejected", approved: true }),
});
check("public visitor cannot insert directly", denied(ins), `HTTP ${ins.status}`);

const upd = await rest("comments?id=not.is.null", publicKey, {
  method: "PATCH",
  body: JSON.stringify({ message: "tampered" }),
});
check("public visitor cannot update comments", denied(upd), `HTTP ${upd.status}`);

const del = await rest("comments?id=not.is.null", publicKey, { method: "DELETE" });
check("public visitor cannot delete comments", denied(del), `HTTP ${del.status}`);

// --- server-side behaviour (secret key) ---
if (writeTests) {
  if (!secretKey) {
    check("secret key available for write tests", false, "set SUPABASE_SECRET_KEY");
  } else {
    const bad = await rest("comments", secretKey, {
      method: "POST",
      body: JSON.stringify({ name: "A", message: "too short name" }),
    });
    check(
      "database rejects a too-short name",
      bad.status === 400 || bad.status === 409,
      `HTTP ${bad.status}`,
    );

    const link = await rest("comments", secretKey, {
      method: "POST",
      body: JSON.stringify({ name: "Tester", message: "visit https://spam.example now" }),
    });
    check(
      "database rejects links in the message",
      link.status === 400 || link.status === 409,
      `HTTP ${link.status}`,
    );

    const submission_id = randomUUID();
    const body = JSON.stringify({
      name: "Check Script",
      message: "Temporary test comment",
      approved: false,
      submission_id,
      ip_hash: "check-script",
    });
    const created = await rest("comments?select=id", secretKey, {
      method: "POST",
      body,
      headers: { Prefer: "return=representation" },
    });
    const row = created.ok ? (await created.json())[0] : null;
    check("server can insert a comment", Boolean(row?.id), `HTTP ${created.status}`);

    if (row?.id) {
      const dup = await rest("comments", secretKey, { method: "POST", body });
      check(
        "same submission id is rejected (no duplicates)",
        dup.status === 409,
        `HTTP ${dup.status}`,
      );

      const seenBefore = await (await rest(`comments?select=id&id=eq.${row.id}`, publicKey)).json();
      check(
        "unapproved comment is invisible to the public",
        Array.isArray(seenBefore) && seenBefore.length === 0,
      );

      await rest(`comments?id=eq.${row.id}`, secretKey, {
        method: "PATCH",
        body: JSON.stringify({ approved: true }),
      });
      const seenAfter = await (await rest(`comments?select=id&id=eq.${row.id}`, publicKey)).json();
      check(
        "approved comment becomes visible to the public",
        Array.isArray(seenAfter) && seenAfter.length === 1,
      );

      const cleanup = await rest(`comments?id=eq.${row.id}`, secretKey, { method: "DELETE" });
      check("test row cleaned up", cleanup.ok, `HTTP ${cleanup.status}`);
    }
  }
}

// --- the browser bundle must not contain privileged keys ---
const staticDir = path.resolve(".next", "static");
if (existsSync(staticDir)) {
  const files = [];
  const walk = (d) => {
    readdirSync(d).forEach((n) => {
      const f = path.join(d, n);

      if (statSync(f).isDirectory()) {
        walk(f);
      } else if (f.endsWith(".js")) {
        files.push(f);
      }
    });
  };
  walk(staticDir);
  const text = files.map((f) => readFileSync(f, "utf8")).join("\n");
  const leaks = [];
  if (secretKey && text.includes(secretKey)) leaks.push("the SUPABASE_SECRET_KEY value");
  if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(text)) leaks.push("an sb_secret_ key");
  if (/service_role/.test(text)) leaks.push('the text "service_role"');
  check(
    `no privileged key in ${files.length} client JavaScript files`,
    leaks.length === 0,
    leaks.join(", "),
  );
} else {
  console.log("SKIP  client bundle scan (run `pnpm build` first)");
}

const failed = results.filter((r) => !r).length;
console.log(
  `\n${results.length - failed}/${results.length} checks passed${writeTests ? "" : " (write tests skipped: add --write)"}`,
);
process.exit(failed ? 1 : 0);
