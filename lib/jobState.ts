/**
 * Print job state: types, the phone-side price estimate, and the pure
 * transitions the context applies. Kept free of React and of other app
 * imports so it can be unit tested with `node --test`.
 */

export interface Document {
  file: File | null;
  name: string;
  pages: number;
  size: number;
  // Backend references
  documentId?: string;
  fileType?: string;
  processed?: boolean;
}

export interface Settings {
  colorMode: 'bw' | 'color';
  pageRange: 'all' | 'custom';
  customRange?: string;
  copies: number;
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter';
  printSides: 'single' | 'double';
}

/** Phone-side estimate. Only ever shown labelled as an estimate. */
export interface Pricing {
  basePrice: number;
  totalPages: number;
  total: number;
}

/** The price the backend computed for the print job. This is what gets charged. */
export interface JobPricing {
  pricePerPage: number;
  totalPages: number;
  totalAmount: number;
}

/** A Razorpay (or mock) order the backend created for the current job. */
export interface PaymentOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface Payment {
  method?: 'upi' | 'card' | 'wallet';
  transactionId?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  orderId?: string;
  paymentId?: string;
  order?: PaymentOrder;
  /** Money was taken but did not match the job total, so nothing will print (refund case). */
  amountMismatch?: boolean;
}

export interface PrintJob {
  sessionId: string;
  kioskId: string;
  document: Document;
  settings: Settings;
  pricing: Pricing;
  payment: Payment;
  status: 'draft' | 'pending' | 'processing' | 'complete' | 'error';
  createdAt: number;
  // Backend references
  backendSessionId?: string;
  /** Per-session secret from POST /sessions, sent as X-Session-Token. */
  sessionToken?: string;
  printJobId?: string;
  /** Backend price for printJobId. Absent while the job is missing or out of date. */
  jobPricing?: JobPricing;
  /** True when settings changed after the job was created, so the job must be updated. */
  jobStale?: boolean;
  expiresAt?: string;
}

export const DEFAULT_KIOSK_ID = 'KIOSK001';

export const defaultPrintJob: PrintJob = {
  sessionId: '',
  kioskId: DEFAULT_KIOSK_ID,
  document: {
    file: null,
    name: '',
    pages: 0,
    size: 0,
  },
  settings: {
    colorMode: 'bw',
    pageRange: 'all',
    copies: 1,
    orientation: 'portrait',
    paperSize: 'a4',
    printSides: 'single',
  },
  pricing: {
    basePrice: 2,
    totalPages: 0,
    total: 0,
  },
  payment: {
    status: 'pending',
  },
  status: 'draft',
  createdAt: 0,
};

// Counts distinct pages in input like "1-3, 5", ignoring anything outside 1..maxPage.
export function countPagesInRange(range: string, maxPage: number): number {
  const pages = new Set<number>();
  for (const part of range.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) continue;
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
      if (p >= 1 && p <= maxPage) pages.add(p);
    }
  }
  return pages.size;
}

export function getPricing(settings: Settings, document: Document): Pricing {
  const pricePerPage = settings.colorMode === 'bw' ? 2 : 10;
  let totalPages = document.pages;

  if (settings.pageRange === 'custom' && settings.customRange) {
    const selected = countPagesInRange(settings.customRange, document.pages);
    if (selected > 0) totalPages = selected;
  }

  if (settings.printSides === 'double') {
    totalPages = Math.ceil(totalPages / 2);
  }

  return {
    basePrice: pricePerPage,
    totalPages: totalPages * settings.copies,
    total: totalPages * pricePerPage * settings.copies,
  };
}

function shallowChanged<T extends object>(prev: T, patch: Partial<T>): boolean {
  return (Object.keys(patch) as (keyof T)[]).some((key) => prev[key] !== patch[key]);
}

/** Payment fields that belong to one specific job and order. */
function clearOrder(payment: Payment): Payment {
  return { status: 'pending', method: payment.method };
}

/**
 * Apply a settings change. If a print job already exists, its backend price
 * and any payment order no longer match what the customer chose, so both are
 * dropped and the job is marked stale. Review re-syncs it before payment.
 */
export function applySettings(prev: PrintJob, patch: Partial<Settings>): PrintJob {
  if (!shallowChanged(prev.settings, patch)) return prev;
  const settings = { ...prev.settings, ...patch };
  return {
    ...prev,
    settings,
    pricing: getPricing(settings, prev.document),
    jobPricing: undefined,
    jobStale: prev.printJobId ? true : undefined,
    payment: clearOrder(prev.payment),
  };
}

/**
 * Apply a document change. A different document means the old print job (and
 * any order for it) is for the wrong file, so the job is forgotten entirely.
 */
export function applyDocument(prev: PrintJob, patch: Partial<Document>): PrintJob {
  if (!shallowChanged(prev.document, patch)) return prev;
  const document = { ...prev.document, ...patch };
  return {
    ...prev,
    document,
    pricing: getPricing(prev.settings, document),
    printJobId: undefined,
    jobPricing: undefined,
    jobStale: undefined,
    payment: clearOrder(prev.payment),
  };
}

/** What a page needs to know that the backend print job is current. */
export function needsJobSync(job: PrintJob): boolean {
  return !job.printJobId || !!job.jobStale || !job.jobPricing;
}

/** The amount that will actually be charged, or null if the backend has not priced it yet. */
export function chargedAmount(job: PrintJob): number | null {
  if (job.payment.order) return job.payment.order.amount;
  if (job.jobPricing) return job.jobPricing.totalAmount;
  return null;
}

// ==================== PERSISTENCE ====================

export const STORAGE_KEY = 'mprnt-qr:job';

/** Everything except the File object, which cannot be serialised. */
export type StoredPrintJob = Omit<PrintJob, 'document'> & {
  document: Omit<Document, 'file'>;
};

export function toStored(job: PrintJob): StoredPrintJob {
  const { file: _file, ...document } = job.document;
  return { ...job, document };
}

export function fromStored(raw: string | null): PrintJob | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<StoredPrintJob>;
    if (!stored || typeof stored !== 'object' || !stored.backendSessionId) return null;
    return {
      ...defaultPrintJob,
      ...stored,
      document: { ...defaultPrintJob.document, ...stored.document, file: null },
      settings: { ...defaultPrintJob.settings, ...stored.settings },
      pricing: { ...defaultPrintJob.pricing, ...stored.pricing },
      payment: { ...defaultPrintJob.payment, ...stored.payment },
    } as PrintJob;
  } catch {
    return null;
  }
}

// ==================== SERVER MERGE ====================

/** Shape of GET /sessions/:id `data` that the merge reads. */
export interface ServerSession {
  session: { sessionId: string; status: string; expiresAt: string };
  kiosk: { kioskId: string } | null;
  document: {
    id: string;
    filename: string;
    fileType: string;
    pageCount: number;
    fileSizeBytes: number;
    processed: boolean;
  } | null;
  printJob: {
    jobId: string;
    status: string;
    pricing?: { pricePerPage: number; totalPages: number; totalAmount: number };
  } | null;
  payment: {
    transactionId: string;
    status: string;
    amount: number;
    /** Captured, but the backend did not queue the job (409 AMOUNT_MISMATCH). */
    amountMismatch?: boolean;
  } | null;
}

const CAPTURED = new Set(['captured', 'success', 'completed', 'paid']);
const JOB_DONE = new Set(['completed']);

export function isPaymentCaptured(status: string | undefined): boolean {
  return !!status && CAPTURED.has(status.toLowerCase());
}

/**
 * Rebuild local state from the backend's view of the session after a reload.
 * The backend wins on everything it knows: expiry, kiosk, document, and above
 * all whether the job has been paid for.
 */
export function mergeServerSession(job: PrintJob, server: ServerSession): PrintJob {
  if (server.session.sessionId !== job.backendSessionId) return job;

  const next: PrintJob = { ...job, expiresAt: server.session.expiresAt };
  if (server.kiosk?.kioskId) next.kioskId = server.kiosk.kioskId;

  if (server.document) {
    next.document = {
      ...job.document,
      documentId: server.document.id,
      name: job.document.name || server.document.filename,
      pages: server.document.pageCount || job.document.pages,
      size: job.document.size || server.document.fileSizeBytes,
      fileType: server.document.fileType,
      processed: server.document.processed,
    };
  }

  const serverJob = server.printJob;
  const captured = isPaymentCaptured(server.payment?.status);
  const paid = captured && !server.payment?.amountMismatch;

  if (serverJob && captured && !paid) {
    // Paid the wrong amount: recorded for a refund and never queued. Do not
    // send the customer to a processing screen that would wait forever.
    next.printJobId = serverJob.jobId;
    next.jobStale = undefined;
    if (serverJob.pricing) next.jobPricing = { ...serverJob.pricing };
    next.payment = {
      ...job.payment,
      status: 'failed',
      amountMismatch: true,
      transactionId: server.payment!.transactionId || job.payment.transactionId,
    };
    next.status = 'pending';
  } else if (serverJob && paid) {
    // Money has been taken for this job; nothing local may override that.
    next.printJobId = serverJob.jobId;
    next.jobStale = undefined;
    if (serverJob.pricing) next.jobPricing = { ...serverJob.pricing };
    next.payment = {
      ...job.payment,
      status: 'success',
      transactionId: server.payment!.transactionId || job.payment.transactionId,
    };
    next.status = JOB_DONE.has(serverJob.status) ? 'complete' : job.status === 'complete' ? 'complete' : 'processing';
  } else if (serverJob && serverJob.jobId === job.printJobId && !job.jobStale && serverJob.pricing) {
    next.jobPricing = { ...serverJob.pricing };
  } else if (serverJob && !job.printJobId) {
    // The job exists on the backend (one per session) but local state lost it.
    next.printJobId = serverJob.jobId;
    next.jobStale = true;
  }

  return next;
}

// ==================== TIMER ====================

/** Milliseconds until `expiresAt`, never negative; null when unknown or invalid. */
export function msUntil(expiresAt: string | undefined, now: number): number | null {
  if (!expiresAt) return null;
  const at = Date.parse(expiresAt);
  if (Number.isNaN(at)) return null;
  return Math.max(0, at - now);
}
