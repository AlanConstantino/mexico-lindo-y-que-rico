import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runtimeRequire = createRequire(import.meta.url);

// Load the actual TypeScript modules with external services replaced by test doubles.
function createLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const absolute = path.resolve(__dirname, '..', filename);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    if (absolute.endsWith('.json')) return JSON.parse(fs.readFileSync(absolute, 'utf8'));
    const compiledModule = { exports: {} };
    cache.set(absolute, compiledModule);
    const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith('@/') || id.startsWith('.')) {
        let resolved = id.startsWith('@/') ? path.resolve(__dirname, '../src', id.slice(2)) : path.resolve(path.dirname(absolute), id);
        if (!path.extname(resolved)) resolved += '.ts';
        return load(resolved);
      }
      return runtimeRequire(id);
    };
    new Function('require', 'module', 'exports', code)(localRequire, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  return load;
}

const load = createLoader();
const pricing = load('src/lib/pricing.ts');
const time = load('src/lib/event-time.ts');
const en = load('messages/en.json');
const es = load('messages/es.json');

test('sandbox fails closed for hosted databases, live Stripe keys and real email delivery', () => {
  const { assertSandboxSafety } = load('src/lib/sandbox-safety.ts');
  const safe = {
    APP_ENV: 'sandbox', NEXT_PUBLIC_SANDBOX: 'true',
    NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54331',
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3001',
    SANDBOX_MAILPIT_URL: 'http://127.0.0.1:54334',
    STRIPE_SECRET_KEY: 'sk_test_example', RESEND_API_KEY: '',
  };
  assert.doesNotThrow(() => assertSandboxSafety(safe));
  for (const unsafe of [
    { NEXT_PUBLIC_SUPABASE_URL: 'https://production.supabase.co' },
    { STRIPE_SECRET_KEY: 'sk_live_example' },
    { RESEND_API_KEY: 're_example' },
    { SANDBOX_MAILPIT_URL: 'https://mail.example.com' },
    { NEXT_PUBLIC_SITE_URL: 'https://rico.catering' },
    { APP_ENV: 'production' },
    { NEXT_PUBLIC_SANDBOX: 'false' },
  ]) assert.throws(() => assertSandboxSafety({ ...safe, ...unsafe }));
  assert.doesNotThrow(() => assertSandboxSafety({ APP_ENV: 'production' }));
});

const expectedExtras = { rice: 50, beans: 50, quesadillas: 60, jalapenos: 25, guacamole: 60, salsa: 60, agua: 35, salad: 45, burgers: 5, hotdogs: 3, baconHotdogs: 4, chips: 30, extraTime: 60, extraMeat: 60 };

test('approved package and extras catalog, including the 200-person exception', () => {
  assert.deepEqual(pricing.GUEST_OPTIONS, {
    '2hr': [{ count: 50, price: 595 }, { count: 75, price: 695 }],
    '3hr': [{ count: 100, price: 795 }, { count: 125, price: 895 }, { count: 150, price: 995 }, { count: 175, price: 1095 }, { count: 200, price: 1350 }],
  });
  assert.deepEqual(Object.fromEntries(pricing.EXTRA_OPTIONS.map(e => [e.id, e.price])), expectedExtras);
  assert.equal(pricing.calculateTotal('2hr', 50, { rice: 1, chips: 1, baconHotdogs: 10, extraTime: 1 }), 775);
  for (const invalid of [['2hr', 25], ['2hr', 100], ['3hr', 50], ['unknown', 50], [null, 50]]) {
    assert.equal(pricing.isValidPackage(...invalid), false);
  }
});

test('cash deposits retain cents and agree with checkout', () => {
  assert.equal(pricing.calculateDeposit(683, 10), 68.30);
  assert.equal(pricing.calculateDeposit(715, 10), 71.50);
});

test('start times cover noon, midnight, defaults, arbitrary minutes and invalid values', () => {
  assert.equal(time.toEventTime('3', '00', 'PM'), '15:00');
  assert.equal(time.toEventTime('12', '00', 'AM'), '00:00');
  assert.equal(time.toEventTime('12', '00', 'PM'), '12:00');
  assert.equal(time.toEventTime('9', '17', 'AM'), '09:17');
  assert.equal(time.toEventTime('', '00', 'PM'), null);
  assert.equal(time.toEventTime('13', '00', 'PM'), null);
  for (const invalid of [null, '', '3:00', '24:00', '12:60', '03:--']) assert.equal(time.isEventTime(invalid), false);
  assert.equal(time.setupArrivalTime('00:30'), '11:30 PM');
  assert.equal(time.setupArrivalTime('12:00'), '11:00 AM');
});

test('changed UI labels have matching English and Spanish keys and placeholders', () => {
  function flatten(value, prefix = '') {
    return Object.entries(value).flatMap(([key, v]) => typeof v === 'object' ? flatten(v, `${prefix}${key}.`) : [[`${prefix}${key}`, v]]);
  }
  const english = Object.fromEntries(flatten(en));
  const spanish = Object.fromEntries(flatten(es));
  assert.deepEqual(Object.keys(english).sort(), Object.keys(spanish).sort());
  for (const key of Object.keys(english)) {
    const vars = value => [...value.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    assert.deepEqual(vars(english[key]), vars(spanish[key]), key);
  }
  for (const id of Object.keys(expectedExtras)) {
    assert.equal(typeof en.extras.items[id], 'string');
    assert.equal(typeof es.extras.items[id], 'string');
  }
  assert.match(en.extras.items.aguaNote, /ice and cups/);
  assert.match(es.extras.items.aguaNote, /hielo y vasos/);
  assert.doesNotMatch(JSON.stringify(es), /totopos/i);
});

function harness() {
  const captured = { sessions: [], bookings: [], emails: [] };
  const settings = { cc_surcharge_percent: 10, stripe_fee_percent: 2.9, stripe_fee_flat: 30, cash_deposit_percent: 10 };
  const supabaseAdmin = { from(table) {
    return {
      select() { return { single: async () => ({ data: settings }) }; },
      insert(booking) {
        assert.equal(table, 'bookings');
        captured.bookings.push(booking);
        return { select() { return { single: async () => ({ data: { id: 'booking-test', booking_number: 'QR-TEST' } }) }; } };
      },
    };
  } };
  class Stripe {
    checkout = { sessions: { create: async data => {
      captured.sessions.push(data);
      return { id: 'cs_test', url: 'https://checkout.example.test/session' };
    } } };
  }
  class Resend { emails = { send: async data => { captured.emails.push(data); return { data: { id: 'email-test' } }; } }; }
  const scopedLoad = createLoader({ stripe: Stripe, resend: { Resend }, '@/lib/supabase': { supabaseAdmin, generateBookingNumber: () => 'QR-TEST' } });
  const notifications = scopedLoad('src/lib/notifications.ts');
  const checkout = scopedLoad('src/app/api/checkout/route.ts');
  const body = { eventDate: '2026-12-19', eventTime: '15:00', serviceType: '2hr', guestCount: 50,
    meats: ['asada', 'pastor', 'chicken', 'chorizo'], extras: { rice: 1, baconHotdogs: 10, chips: 1 },
    customerName: 'Test Customer', customerEmail: 'test@example.test', customerPhone: '5555550100', eventAddress: '123 Test St, Los Angeles, CA 90001',
    totalPrice: 1, locale: 'en' };
  async function post(overrides = {}) {
    return checkout.POST(new Request('http://localhost/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost' }, body: JSON.stringify({ ...body, ...overrides }) }));
  }
  return { captured, post, notifications };
}

for (const locale of ['en', 'es']) {
  test(`${locale}: card checkout charges server prices and snapshots extras`, async () => {
    const { post, captured } = harness();
    const response = await post({ locale });
    assert.equal(response.status, 200);
    const session = captured.sessions[0];
    const subtotal = 715;
    const expected = Math.round((subtotal + 72 + 21.04) * 100);
    assert.equal(session.line_items.reduce((sum, item) => sum + item.quantity * item.price_data.unit_amount, 0), expected);
    assert.equal(captured.bookings[0].total_price, expected);
    assert.deepEqual(captured.bookings[0].extras, [
      { id: 'rice', quantity: 1, unitPrice: 50 }, { id: 'baconHotdogs', quantity: 10, unitPrice: 4 }, { id: 'chips', quantity: 1, unitPrice: 30 },
    ]);
    const messages = locale === 'en' ? en : es;
    assert.ok(session.line_items.some(item => item.price_data.product_data.name === messages.extras.items.baconHotdogs));
    assert.ok(session.success_url.includes(`/${locale}/booking/success`));
    assert.equal(captured.emails.length, 0);
  });

  test(`${locale}: cash checkout uses new prices, no Stripe, and localized confirmation`, async () => {
    const { post, captured } = harness();
    const response = await post({ locale, paymentMethod: 'cash', cashPaymentMethod: 'zelle', cashPaymentOption: 'deposit' });
    assert.equal(response.status, 200);
    assert.equal(captured.sessions.length, 0);
    assert.equal(captured.bookings[0].total_price, 71500);
    assert.equal(captured.bookings[0].deposit_amount, 7150);
    assert.equal(captured.bookings[0].balance_due, 64350);
    const email = captured.emails.find(email => JSON.stringify(email.to).includes('test@example.test'));
    assert.ok(email);
    assert.ok(email.html.includes((locale === 'en' ? en : es).extras.items.baconHotdogs));
    assert.match(email.html, /\$40/); // Ten bacon hot dogs at $4.
  });
}

test('invalid packages, incomplete times and invalid extras cause no writes or Stripe sessions', async () => {
  for (const input of [{ guestCount: 25 }, { serviceType: '3hr', guestCount: 50 }, { eventTime: null }, { eventTime: '03:--' }, { extras: { rice: -1 } }, { extras: { chips: 1.5 } }, { extras: { unknown: 1 } }]) {
    const { post, captured } = harness();
    assert.equal((await post(input)).status, 400);
    assert.equal(captured.sessions.length, 0);
    assert.equal(captured.bookings.length, 0);
    assert.equal(captured.emails.length, 0);
  }
});

test('emails preserve legacy prices and honor stored prices even after catalog changes', () => {
  const { notifications } = harness();
  const extras = [{ id: 'rice', quantity: 2 }, { id: 'rice', quantity: 2, unitPrice: 50 }, { id: 'baconHotdogs', quantity: 2, unitPrice: 3.5 }];
  for (const locale of ['en', 'es']) {
    const rows = notifications.mapExtrasForEmail(extras, locale);
    assert.deepEqual(rows.map(row => row.price), ['$80', '$100', '$7']);
    assert.equal(rows[2].name, (locale === 'en' ? en : es).extras.items.baconHotdogs);
  }
});
