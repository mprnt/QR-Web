/**
 * MPrnt Backend API Client
 * Matches the actual backend implementation at http://localhost:3000/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.message || 'An error occurred',
      response.status,
      data.code
    );
  }

  return data;
}

// ==================== SESSION ENDPOINTS ====================

export interface CreateSessionRequest {
  kioskId: string;
}

export interface SessionResponse {
  status: string;
  data: {
    sessionId: string;
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
  data: {
    session: {
      sessionId: string;
      status: string;
      createdAt: string;
      expiresAt: string;
      completedAt: string | null;
    };
    kiosk: {
      kioskId: string;
      location: string;
      status: string;
      capabilities: any;
    };
    document: {
      id: string;
      filename: string;
      fileType: string;
      pageCount: number;
      fileSizeBytes: number;
      uploadedAt: string;
      processed: boolean;
    } | null;
    printJob: {
      id: string;
      status: string;
      settings: any;
      totalAmount: number;
      createdAt: string;
    } | null;
    payment: {
      transactionId: string;
      status: string;
      amount: number;
      method: string;
      paidAt: string;
    } | null;
  };
}

export async function createSession(kioskId: string = 'KIOSK001'): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kioskId }),
  });
  return handleResponse<SessionResponse>(response);
}

export async function getSession(sessionId: string): Promise<GetSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
  return handleResponse<GetSessionResponse>(response);
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
          reject(new APIError(error.message || 'Upload failed', xhr.status));
        } catch (err) {
          reject(new APIError('Upload failed', xhr.status));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new APIError('Network error during upload', 0));
    });

    xhr.open('POST', `${API_BASE_URL}/sessions/${sessionId}/documents`);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const result = await handleResponse<CreatePrintJobResponse>(response);
  return result.data;
}

export async function getPrintJob(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/print-jobs/${jobId}`);
  return handleResponse(response);
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const result = await handleResponse<VerifyPaymentResponse>(response);
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
  const response = await fetch(`${API_BASE_URL}/queue/jobs/${jobId}`);
  const result = await handleResponse<GetJobStatusResponse>(response);
  return result.data;
}

// ==================== KIOSK ENDPOINTS ====================

export interface Kiosk {
  id: string;
  kiosk_id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  capabilities: {
    supportsColor?: boolean;
    supportsDoubleSided?: boolean;
    paperSizes?: string[];
  };
  printer_status?: string;
  created_at?: string;
  updated_at?: string;
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
