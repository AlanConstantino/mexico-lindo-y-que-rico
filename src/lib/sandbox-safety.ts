/** Local sandbox must never reach the hosted database or live payment/email services. */
export function assertSandboxSafety(env: NodeJS.ProcessEnv = process.env) {
  if (env.APP_ENV !== "sandbox" && env.NEXT_PUBLIC_SANDBOX !== "true") return;
  if (env.APP_ENV !== "sandbox" || env.NEXT_PUBLIC_SANDBOX !== "true") {
    throw new Error("Both sandbox environment flags must be enabled.");
  }
  for (const [key, expected] of Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54331",
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3001",
    SANDBOX_MAILPIT_URL: "http://127.0.0.1:54334",
  })) {
    if (env[key] !== expected) throw new Error(`Sandbox requires ${key}=${expected}`);
  }
  if (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
    throw new Error("Sandbox accepts only a Stripe test secret key.");
  }
  if (env.RESEND_API_KEY) throw new Error("Sandbox must not have a Resend API key.");
}
