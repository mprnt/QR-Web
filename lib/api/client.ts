/**
 * MPrnt Backend API Client
 * Matches the actual backend implementation at http://localhost:3000/api/v1
 */

import { APIError, handleResponse } from './http';
import type { Rates, ServerSession } from '../jobState';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const SESSION_TOKEN_HEADER = 'X-Session-Token';

// The per-session secret the backend returns once from POST /sessions. Every
// session, document, job, payment and queue call must carry it.
let sessionToken: string | null = null;

export function setSessionToken(token: string | null | undefined): void {
  sessionToken = token || null;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (sessionToken) headers[SESSION_TOKEN_HEADER] = sessionToken;
  return headers;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ==================== SESSION ENDPOINTS ====================

export interface CreateSessionRequest {
  kioskId: string;
}

export interface SessionResponse {
  status: string;
  data: {
    sessionId: string;
    /** Per-session secret, returned only here. Send it as X-Session-Token. */
    sessionToken?: string;
    expiresAt: string;
    createdAt: string;
    status: string;
    kioskInfo: {
      kioskId: string;
      location: string;
      capabilities: any;
      status: string;
    };
  };
}

export interface GetSessionResponse {
  status: string;
  data: ServerSession;
}

export async function createSession(kioskId: string = 'KIOSK001'): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ kioskId }),
  });
  return handleResponse<SessionResponse>(response);
}

export async function getSession(sessionId: string): Promise<GetSessionResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    headers: authHeaders(),
  });
  const result = await handleResponse<GetSessionResponse>(response);
  return result.data;
}

// ==================== PRICING ====================

/** Rates in force at a kiosk, as set from the admin dashboard. */
export async function getKioskRates(kioskId: string): Promise<Rates> {
  const response = await fetch(`${API_BASE_URL}/public/pricing?kioskId=${encodeURIComponent(kioskId)}`);
  const result = await handleResponse<{ status: string; data: Rates }>(response);
  return result.data;
}

// ==================== DOCUMENT ENDPOINTS ====================

export interface UploadDocumentResponse {
  status: string;
  message: string;
  data: {
    documentId: string;
    filename: string;
    fileType: string;
    fileSizeBytes: number;
    pageCount: number;
    processed: boolean;
    uploadedAt: string;
  };
}

export async function uploadDocument(
  sessionId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadDocumentResponse['data']> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('document', file);

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress((e.loaded / e.total) * 100);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: UploadDocumentResponse = JSON.parse(xhr.responseText);
          resolve(response.data);
        } catch (err) {
          reject(new APIError('Invalid response format', xhr.status));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new APIError(error.message || 'Upload failed', xhr.status, error.code));
        } catch (err) {
          reject(new APIError('Upload failed', xhr.status));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new APIError('Network error during upload', 0));
    });

    xhr.open('POST', `${API_BASE_URL}/sessions/${sessionId}/documents`);
    for (const [name, value] of Object.entries(authHeaders())) {
      xhr.setRequestHeader(name, value);
    }
    xhr.send(formData);
  });
}

// ==================== PRINT JOB ENDPOINTS ====================

export interface PrintSettings {
  colorMode: 'bw' | 'color';
  copies: number;
  pageRange: 'all' | 'custom';
  customRange?: string;
  printSides: 'single' | 'double';
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
}

export interface CreatePrintJobResponse {
  status: string;
  message: string;
  data: {
    jobId: string;
    sessionId: string;
    documentId: string;
    kioskId: string;
    settings: {
      colorMode: string;
      copies: number;
      pageRange: string;
      customRange: string | null;
      printSides: string;
      paperSize: string;
      orientation: string;
    };
    pricing: {
      pricePerPage: number;
      logicalPages: number;
      physicalPages: number;
      totalPages: number;
      totalAmount: number;
      breakdown: {
        logicalPages: number;
        physicalSheets: number;
        copiesMultiplier: number;
        pricePerPage: number;
      };
    };
    status: string;
    createdAt: string;
  };
}

export async function createPrintJob(
  sessionId: string,
  settings: PrintSettings
): Promise<CreatePrintJobResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/print-jobs`, {
    method: 'POST',
    headers: authHeaders(JSON_HEADERS),
    body: JSON.stringify(settings),
  });
  const result = await handleResponse<CreatePrintJobResponse>(response);
  return result.data;
}

export async function updatePrintJobSettings(
  jobId: string,
  settings: PrintSettings
): Promise<CreatePrintJobResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/print-jobs/${jobId}/settings`, {
    method: 'PATCH',
    headers: authHeaders(JSON_HEADERS),
    body: JSON.stringify(settings),
  });
  const result = await handleResponse<CreatePrintJobResponse>(response);
  return result.data;
}

// ==================== PAYMENT ENDPOINTS ====================

export interface CreatePaymentOrderResponse {
  status: string;
  message: string;
  data: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    jobId: string;
    status: string;
    createdAt: string;
  };
}

export async function createPaymentOrder(
  jobId: string
): Promise<CreatePaymentOrderResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/print-jobs/${jobId}/payment/order`, {
    method: 'POST',
    headers: authHeaders(JSON_HEADERS),
  });
  const result = await handleResponse<CreatePaymentOrderResponse>(response);
  return result.data;
}

export interface SimulatePaymentSuccessResponse {
  status: string;
  message: string;
  data: {
    orderId: string;
    paymentId: string;
    signature: string;
    note: string;
  };
}

export async function simulatePaymentSuccess(
  orderId: string
): Promise<SimulatePaymentSuccessResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/payment/mock/simulate-success`, {
    method: 'POST',
    headers: authHeaders(JSON_HEADERS),
    body: JSON.stringify({ orderId }),
  });
  const result = await handleResponse<SimulatePaymentSuccessResponse>(response);
  return result.data;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    verified: boolean;
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    capturedAt: string;
  };
}

export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: authHeaders(JSON_HEADERS),
    body: JSON.stringify(request),
  });
  const result = await handleResponse<VerifyPaymentResponse>(response);
  return result.data;
}

export interface PaymentOrderStatusResponse {
  status: string;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    isPaid: boolean;
    /** isPaid, but the amount did not match the job, so it was not queued. */
    amountMismatch?: boolean;
  };
}

/** Whether an order was captured, e.g. by the webhook while the phone was away. */
export async function getPaymentOrderStatus(
  orderId: string
): Promise<PaymentOrderStatusResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/payment/order/${orderId}/status`, {
    headers: authHeaders(),
  });
  const result = await handleResponse<PaymentOrderStatusResponse>(response);
  return result.data;
}

// ==================== QUEUE ENDPOINTS ====================

export interface GetJobStatusResponse {
  status: string;
  data: {
    jobId: string;
    status: 'queued' | 'assigned' | 'printing' | 'completed' | 'failed' | 'cancelled';
    printedPages?: number;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    failedAt?: string;
  };
}

export async function getJobStatus(jobId: string): Promise<GetJobStatusResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/queue/jobs/${jobId}`, {
    headers: authHeaders(),
  });
  const result = await handleResponse<GetJobStatusResponse>(response);
  return result.data;
}

// ==================== KIOSK ENDPOINTS ====================

export interface Kiosk {
  kioskId: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  capabilities: {
    supportsColor?: boolean;
    supportsDoubleSided?: boolean;
    paperSizes?: string[];
  };
}

export interface ListKiosksResponse {
  status: string;
  data: {
    count: number;
    kiosks: Kiosk[];
  };
}

export async function listKiosks(): Promise<Kiosk[]> {
  const response = await fetch(`${API_BASE_URL}/setup/kiosks`);
  const result = await handleResponse<ListKiosksResponse>(response);
  return result.data.kiosks;
}

export { APIError };
