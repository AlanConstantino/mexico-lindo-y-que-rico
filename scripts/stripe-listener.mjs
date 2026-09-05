import { spawn } from 'node:child_process';

/** Start only a test-mode listener. Keep credentials out of command arguments and logs. */
export function startStripeListener(executable, testKey, onExit) {
  if (!testKey?.startsWith('sk_test_') || testKey === 'sk_test_not_configured') {
    throw new Error('A real Stripe test key is required to start the listener.');
  }
  const child = spawn(executable, [
    'listen', '--events', 'checkout.session.completed',
    '--forward-to', 'http://127.0.0.1:3001/api/webhook',
    '--skip-update', '--color', 'off',
  ], {
    env: { ...process.env, STRIPE_API_KEY: testKey },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = new Promise((resolve, reject) => {
    let output = '';
    let connected = false;
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Stripe listener timed out. Check the test key and internet connection.'));
    }, 30000);
    const read = chunk => {
      if (connected) return;
      output = (output + chunk.toString()).slice(-8192);
      // Wait for the complete secret, even when output is split across chunks.
      const secret = output.match(/whsec_[A-Za-z0-9]+(?=[\s\u001b])/);
      if (secret) {
        connected = true;
        clearTimeout(timeout);
        resolve(secret[0]);
      }
    };
    child.stdout.on('data', read);
    child.stderr.on('data', read);
    child.on('error', () => {
      clearTimeout(timeout);
      reject(new Error('Stripe CLI could not start. Run npm install and retry.'));
    });
    child.on('exit', () => {
      clearTimeout(timeout);
      if (!connected) reject(new Error('Stripe could not connect. Verify that your test key is valid and has CLI access.'));
      else onExit();
    });
  });
  return { child, ready };
}
