# Local test sandbox

Run from the project root:

```sh
npm run sandbox
```

Keep that terminal running. Podman (already installed on this machine) or Docker must be running. The first start downloads the local Supabase services. Node 24 or newer is supported.

| What | Address |
| --- | --- |
| English site | http://127.0.0.1:3001/en |
| Spanish site | http://127.0.0.1:3001/es |
| Admin | http://127.0.0.1:3001/en/admin |
| Captured email inbox | http://127.0.0.1:54334 |
| Local Supabase Studio | http://127.0.0.1:54333 |

The generated admin password is `ADMIN_PASSWORD` in `.env.sandbox.local` at the project root. That file is private and Git-ignored. Use sample names, phone numbers and addresses. Two sample cash bookings from verification are already visible in this machine's sandbox.

## What is isolated

The sandbox uses a separate local database and build directory. Its baseline is a schema-only snapshot of the deployed database taken on September 5, 2026 UTC, including manually applied changes missing from the production migration files. No customer rows were copied. Seed settings use synthetic payment handles, a 10% cash deposit and a seven-day free cancellation window.

`scripts/sandbox.mjs` overrides all application credentials before Next.js loads `.env.local`, so the existing production configuration is preserved. Runtime guards reject hosted database URLs, live Stripe keys and Resend credentials in sandbox mode. Every application email goes to local Mailpit, which has no outbound relay. Do not send money to any payment handle while testing.

This is a local environment on this computer, not a publicly hosted Vercel preview. No paid Supabase project or branch was created. Production migrations and hosting were not changed. Scheduled jobs are not automatically run locally.

## Verify the changes

1. Open each language's booking page. Select an available date, then only an hour. Minutes start at `00` and the period at `PM`; Continue should enable immediately.
2. Check the package prices, including the $1,350 / 200-guest option, and the extras in each language.
3. For a 50-person two-hour package, add one rice, one chips, and ten bacon hot dogs. The total is $715. Choose cash with a deposit: $71.50 is due first and $643.50 remains. Do not make a real payment.
4. Submit using an `@example.test` email. Review the customer and owner messages in the local inbox, then inspect the booking in Admin. Admin changes affect this database only.
5. Try rescheduling and cancellation using the links in the captured emails. Test payment confirmation in Admin and check the resulting emails.

Automated pricing, validation, localization and isolation checks:

```sh
npm test
```

## Optional Stripe test checkout

Cash bookings work immediately. Card checkout stays blocked until a test key is configured. Put your Stripe sandbox/test secret key in the existing Git-ignored `.env.stripe-test.local` file:

```dotenv
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_TEST_KEY
```

Never use an `sk_live_` key. Restart `npm run sandbox` after changing this file. Checkout uses Stripe's hosted page and does not need a publishable key in the browser.

`npm run sandbox` automatically starts the included Stripe CLI in test mode, forwards `checkout.session.completed` events to the local app, and saves the listener's signing secret in `.env.sandbox.local`. No separate Stripe login, webhook endpoint in the Dashboard, or manual signing-secret copy is needed. The supplied test key authenticates both checkout and the listener.

If the listener cannot connect, startup stops with an error. If it disconnects permanently while running, the website stops so you can restart both together. Unsigned webhook requests are rejected. After a successful test checkout, verify that the booking becomes paid in Admin and its emails appear in Mailpit.

The listener startup and credential protections have automated coverage using a simulated CLI. On September 5, 2026 UTC, a real Stripe test-mode Checkout payment was completed with the published test Visa card. The signed event updated the local booking to paid in full, and its confirmation email was captured in Mailpit with local cancellation and rescheduling links. No live payment was made.

## Stop or reset

Press Ctrl+C to stop the website. Stop the sandbox database services while preserving their data:

```sh
npm run sandbox:stop
```

To erase sandbox bookings and reload the schema and synthetic settings, with local Supabase running:

```sh
npm run sandbox:reset
```

That command explicitly targets the local database under `sandbox/`. Never apply this sandbox schema snapshot to the hosted production project. Inbox messages can be cleared separately in Mailpit.
