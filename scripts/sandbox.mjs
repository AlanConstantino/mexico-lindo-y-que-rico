import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { startStripeListener } from './stripe-listener.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const excluded = 'realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor';
console.log('Starting the local sandbox database and email inbox…');
const started = spawnSync('supabase', ['start', '--workdir', 'sandbox', '--exclude', excluded], { encoding: 'utf8' });
if (started.status !== 0) {
  console.error(started.stderr || 'Supabase could not start. Ensure Podman or Docker is running.');
  process.exit(1);
}
const status = spawnSync('supabase', ['status', '--workdir', 'sandbox', '--output', 'json'], { encoding: 'utf8' });
if (status.status !== 0) throw new Error('Cannot read local Supabase status.');
const local = JSON.parse(status.stdout);
if (local.API_URL !== 'http://127.0.0.1:54331') throw new Error('Unexpected sandbox database address.');

const credentialsPath = '.env.sandbox.local';
const saved = existsSync(credentialsPath) ? parseEnv(readFileSync(credentialsPath, 'utf8')) : {};
const stripe = existsSync('.env.stripe-test.local') ? parseEnv(readFileSync('.env.stripe-test.local', 'utf8')) : {};
const stripeKey = stripe.STRIPE_SECRET_KEY || 'sk_test_not_configured';
if (!stripeKey.startsWith('sk_test_')) throw new Error('Only sk_test_ Stripe keys are allowed in this sandbox.');

// Explicitly override every app credential, including values Next would load from .env.local.
// Never pull Vercel production credentials into this configuration.
const env = {
  APP_ENV: 'sandbox',
  NEXT_PUBLIC_SANDBOX: 'true',
  NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.PUBLISHABLE_KEY || local.ANON_KEY,
  SUPABASE_SECRET_KEY: local.SECRET_KEY || local.SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3001',
  SANDBOX_MAILPIT_URL: 'http://127.0.0.1:54334',
  STRIPE_SECRET_KEY: stripeKey,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripe.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: stripe.STRIPE_WEBHOOK_SECRET || '',
  RESEND_API_KEY: '',
  ADMIN_PASSWORD: saved.ADMIN_PASSWORD || randomBytes(18).toString('base64url'),
  JWT_SECRET: saved.JWT_SECRET || randomBytes(32).toString('hex'),
  CRON_SECRET: saved.CRON_SECRET || randomBytes(32).toString('hex'),
};
if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SECRET_KEY) throw new Error('Local database keys unavailable.');

let child;
let listener;
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  child?.kill('SIGTERM');
  listener?.kill('SIGTERM');
  process.exitCode = code;
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());

if (stripeKey !== 'sk_test_not_configured') {
  console.log('Connecting Stripe test payment events…');
  const connection = startStripeListener(path.join(root, 'node_modules/.bin/stripe'), stripeKey, () => {
    if (!stopping) {
      console.error('Stripe listener stopped. Restart npm run sandbox to reconnect.');
      stop(1);
    }
  });
  listener = connection.child;
  try {
    env.STRIPE_WEBHOOK_SECRET = await connection.ready;
  } catch (error) {
    console.error(error.message);
    stop(1);
    process.exit(1);
  }
  if (stopping) process.exit(process.exitCode || 0);
  console.log('Stripe test listener connected; webhook signing configured automatically.');
}
writeFileSync(credentialsPath, Object.entries(env).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('\n') + '\n', { mode: 0o600 });
chmodSync(credentialsPath, 0o600);
console.log('Website: http://127.0.0.1:3001/en  |  Español: http://127.0.0.1:3001/es');
console.log('Test inbox: http://127.0.0.1:54334  |  Database: http://127.0.0.1:54333');
console.log('Admin password is saved in .env.sandbox.local.');
console.log(stripeKey === 'sk_test_not_configured' ? 'Cash testing ready. Card checkout needs a Stripe test key in .env.stripe-test.local.' : 'Stripe test key loaded.');

child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3001'], {
  cwd: root, env: { ...process.env, ...env }, stdio: 'inherit',
});
child.on('error', error => { console.error(error.message); stop(1); });
child.on('exit', code => stop(code ?? 0));
