import { Resend } from "resend";
import { assertSandboxSafety } from "@/lib/sandbox-safety";

type Email = { from: string; to: string | string[]; subject: string; html: string; text: string };

function address(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);
  return { Name: match ? match[1].trim() : "", Email: match ? match[2] : value };
}

export async function sendEmail(email: Email) {
  assertSandboxSafety();
  if (process.env.APP_ENV === "sandbox") {
    // Mailpit stores messages locally. It has no SMTP relay configured.
    const response = await fetch(`${process.env.SANDBOX_MAILPIT_URL}/api/v1/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: address(email.from),
        To: (Array.isArray(email.to) ? email.to : [email.to]).map(address),
        Subject: email.subject,
        HTML: email.html,
        Text: email.text,
      }),
    });
    if (!response.ok) throw new Error(`Sandbox inbox returned ${response.status}`);
    return;
  }
  await new Resend(process.env.RESEND_API_KEY).emails.send(email);
}
