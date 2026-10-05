import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyDocument,
  applySettings,
  chargedAmount,
  defaultPrintJob,
  fromStored,
  getPricing,
  mergeServerSession,
  msUntil,
  needsJobSync,
  toStored,
  type PrintJob,
  type ServerSession,
} from '../lib/jobState.ts';

const order = { keyId: 'rzp_test_x', orderId: 'order_1', amount: 20, currency: 'INR' };

function jobWithOrder(): PrintJob {
  return {
    ...defaultPrintJob,
    backendSessionId: 'sess-1',
    sessionToken: 'tok',
    rates: { bwPerPage: 2, colorPerPage: 5, minCharge: 0 },
    document: { ...defaultPrintJob.document, documentId: 'doc-1', name: 'a.pdf', pages: 5 },
    printJobId: 'job-1',
    jobPricing: { pricePerPage: 2, totalPages: 5, totalAmount: 10 },
    payment: { status: 'pending', orderId: 'order_1', order },
  };
}

test('settings change invalidates the job price and payment order (bug 1)', () => {
  const next = applySettings(jobWithOrder(), { colorMode: 'color' });
  assert.equal(next.printJobId, 'job-1', 'job kept: backend allows one per session, it is PATCHed');
  assert.equal(next.jobStale, true);
  assert.equal(next.jobPricing, undefined);
  assert.equal(next.payment.order, undefined);
  assert.equal(next.payment.orderId, undefined);
  assert.equal(needsJobSync(next), true);
  assert.equal(next.pricing.total, 25, 'estimate recomputed at the colour rate');
});

test('a settings "change" to the same value keeps the job', () => {
  const prev = jobWithOrder();
  assert.equal(applySettings(prev, { colorMode: 'bw', copies: 1 }), prev);
});

test('document change drops the print job entirely (bug 1)', () => {
  const next = applyDocument(jobWithOrder(), { documentId: 'doc-2', pages: 3 });
  assert.equal(next.printJobId, undefined);
  assert.equal(next.jobPricing, undefined);
  assert.equal(next.payment.order, undefined);
  assert.equal(needsJobSync(next), true);
});

test('charged amount comes from the backend, never the estimate (bug 2)', () => {
  const job = jobWithOrder();
  assert.equal(chargedAmount(job), 20, 'order amount wins');
  assert.equal(chargedAmount({ ...job, payment: { status: 'pending' } }), 10, 'then job total');
  assert.equal(chargedAmount({ ...defaultPrintJob, pricing: { basePrice: 2, totalPages: 3, total: 6 } }), null);
});

test('state survives a round trip through storage, minus the File (bug 3)', () => {
  const job = { ...jobWithOrder(), document: { ...jobWithOrder().document, file: {} as File } };
  const restored = fromStored(JSON.stringify(toStored(job)));
  assert.ok(restored);
  assert.equal(restored.document.file, null);
  assert.equal(restored.backendSessionId, 'sess-1');
  assert.equal(restored.sessionToken, 'tok');
  assert.equal(restored.printJobId, 'job-1');
  assert.deepEqual(restored.payment.order, order);
  assert.equal(fromStored('not json'), null);
  assert.equal(fromStored(JSON.stringify({ printJobId: 'x' })), null, 'no session, nothing to restore');
  assert.equal(fromStored(null), null);
});

function server(overrides: Partial<ServerSession> = {}): ServerSession {
  return {
    session: { sessionId: 'sess-1', status: 'active', expiresAt: '2030-01-01T00:00:00.000Z' },
    kiosk: { kioskId: 'KIOSK007' },
    document: { id: 'doc-1', filename: 'a.pdf', fileType: 'pdf', pageCount: 5, fileSizeBytes: 100, processed: true },
    printJob: { jobId: 'job-1', status: 'queued', pricing: { pricePerPage: 2, totalPages: 5, totalAmount: 10 } },
    payment: { transactionId: 'txn-1', status: 'captured', amount: 10 },
    ...overrides,
  };
}

test('reload after payment rebuilds a paid job from GET /sessions/:id (bug 3)', () => {
  const lost: PrintJob = { ...defaultPrintJob, backendSessionId: 'sess-1' };
  const next = mergeServerSession(lost, server());
  assert.equal(next.printJobId, 'job-1');
  assert.equal(next.payment.status, 'success');
  assert.equal(next.payment.transactionId, 'txn-1');
  assert.equal(next.status, 'processing');
  assert.equal(next.kioskId, 'KIOSK007');
  assert.equal(next.expiresAt, '2030-01-01T00:00:00.000Z');
  assert.equal(next.document.documentId, 'doc-1');
});

test('captured with an amount mismatch is not shown as paid (no endless processing screen)', () => {
  const next = mergeServerSession(
    { ...defaultPrintJob, backendSessionId: 'sess-1' },
    server({ payment: { transactionId: 'txn-1', status: 'captured', amount: 10, amountMismatch: true } })
  );
  assert.equal(next.printJobId, 'job-1');
  assert.equal(next.payment.status, 'failed');
  assert.equal(next.payment.amountMismatch, true);
  assert.notEqual(next.status, 'processing');
});

test('completed job on the server shows as complete', () => {
  const next = mergeServerSession(
    { ...defaultPrintJob, backendSessionId: 'sess-1' },
    server({ printJob: { jobId: 'job-1', status: 'completed' } })
  );
  assert.equal(next.status, 'complete');
});

test('unpaid server job does not overwrite local stale settings', () => {
  const local = applySettings(jobWithOrder(), { copies: 3 });
  const next = mergeServerSession(local, server({ payment: null }));
  assert.equal(next.jobStale, true);
  assert.equal(next.jobPricing, undefined);
  assert.equal(next.payment.status, 'pending');
});

test('server data for another session is ignored', () => {
  const local = jobWithOrder();
  assert.equal(mergeServerSession(local, server({ session: { sessionId: 'other', status: 'x', expiresAt: '' } })), local);
});

test('timer counts down to the backend expiresAt (bug 4)', () => {
  const now = Date.parse('2026-10-05T10:00:00.000Z');
  assert.equal(msUntil('2026-10-05T10:05:00.000Z', now), 5 * 60 * 1000);
  assert.equal(msUntil('2026-10-05T09:00:00.000Z', now), 0);
  assert.equal(msUntil(undefined, now), null);
  assert.equal(msUntil('garbage', now), null);
});

test('estimate uses the kiosk rates from the dashboard, per side and copy', () => {
  const rates = { bwPerPage: 3, colorPerPage: 7, minCharge: 0 };
  const document = { ...defaultPrintJob.document, pages: 5 };
  const bw = getPricing({ ...defaultPrintJob.settings, copies: 2 }, document, rates);
  assert.deepEqual(bw, { basePrice: 3, totalPages: 10, total: 30 });
  const colorDouble = getPricing(
    { ...defaultPrintJob.settings, colorMode: 'color', printSides: 'double', copies: 2 },
    document,
    rates
  );
  assert.deepEqual(colorDouble, { basePrice: 7, totalPages: 6, total: 42 });
  const withMin = getPricing(defaultPrintJob.settings, { ...document, pages: 1 }, { ...rates, minCharge: 10 });
  assert.equal(withMin.total, 10);
});

test('without backend rates there is no price, only the page count', () => {
  const document = { ...defaultPrintJob.document, pages: 3 };
  assert.deepEqual(getPricing(defaultPrintJob.settings, document, null), { basePrice: 0, totalPages: 3, total: 0 });
  assert.equal(defaultPrintJob.rates, null, 'no hardcoded default rates');
});
