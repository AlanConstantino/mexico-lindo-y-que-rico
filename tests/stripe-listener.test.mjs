import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { startStripeListener } from '../scripts/stripe-listener.mjs';

function fixture(t, source) {
  const dir = mkdtempSync(path.join(tmpdir(), 'catering-stripe-test-'));
  const executable = path.join(dir, 'stripe');
  writeFileSync(executable, `#!${process.execPath}\n${source}`, { mode: 0o700 });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return executable;
}

test('Stripe listener rejects missing, placeholder and live keys before spawning', () => {
  for (const key of ['', 'sk_test_not_configured', 'sk_live_example']) {
    assert.throws(() => startStripeListener('/does-not-exist', key, () => {}), /test key/);
  }
});

test('Stripe listener passes the key privately and waits for a complete signing secret', async t => {
  const executable = fixture(t, `
    const assert = require('node:assert/strict');
    assert.equal(process.env.STRIPE_API_KEY, 'sk_test_fixture');
    assert.ok(!process.argv.includes('sk_test_fixture'));
    assert.ok(!process.argv.includes('--live'));
    assert.ok(process.argv.includes('http://127.0.0.1:3001/api/webhook'));
    process.stderr.write('> Ready! Your webhook signing secret is whsec_part');
    setTimeout(() => process.stderr.write('two (^C to quit)\\n'), 20);
    setTimeout(() => process.exit(0), 50);
  `);
  let notifyExit;
  const exited = new Promise(resolve => { notifyExit = resolve; });
  const connection = startStripeListener(executable, 'sk_test_fixture', notifyExit);
  t.after(() => connection.child.kill());
  assert.equal(await connection.ready, 'whsec_parttwo');
  await exited;
});

test('Stripe listener reports connection failure without exposing CLI output', async t => {
  const executable = fixture(t, `process.stderr.write('sk_test_fixture invalid'); process.exit(1);`);
  const connection = startStripeListener(executable, 'sk_test_fixture', () => {});
  await assert.rejects(connection.ready, error => /could not connect/.test(error.message) && !error.message.includes('sk_test_fixture'));
});
