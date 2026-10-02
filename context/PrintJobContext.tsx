'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Simplified context matching backend flow
interface Document {
  file: File | null;
  name: string;
  pages: number;
  size: number;
  // Backend references
  documentId?: string;
  fileType?: string;
  processed?: boolean;
}

interface Settings {
  colorMode: 'bw' | 'color';
  pageRange: 'all' | 'custom';
  customRange?: string;
  copies: number;
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter';
  printSides: 'single' | 'double';
}

interface Pricing {
  basePrice: number;
  totalPages: number;
  total: number;
}

interface Payment {
  method?: 'upi' | 'card' | 'wallet';
  transactionId?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  orderId?: string;
  paymentId?: string;
}

interface PrintJob {
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
  printJobId?: string;
  expiresAt?: string;
}

interface PrintJobContextType {
  printJob: PrintJob;
  updateDocument: (doc: Partial<Document>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updatePricing: (pricing: Partial<Pricing>) => void;
  updatePayment: (payment: Partial<Payment>) => void;
  updateStatus: (status: PrintJob['status']) => void;
  calculatePrice: () => void;
  resetJob: () => void;
  setBackendSession: (sessionId: string, expiresAt: string) => void;
  setPrintJobId: (printJobId: string) => void;
  setKiosk: (kioskId: string) => void;
}

const defaultPrintJob: PrintJob = {
  sessionId: '',
  kioskId: 'KIOSK001',
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
function countPagesInRange(range: string, maxPage: number): number {
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

function getPricing(settings: Settings, document: Document): Pricing {
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

const PrintJobContext = createContext<PrintJobContextType | undefined>(undefined);

export function PrintJobProvider({ children }: { children: ReactNode }) {
  const [printJob, setPrintJob] = useState<PrintJob>(defaultPrintJob);

  useEffect(() => {
    if (printJob.createdAt !== 0) return;

    const createdAt = Date.now();
    setPrintJob(prev => ({
      ...prev,
      sessionId: `S${createdAt}`,
      createdAt,
    }));
  }, [printJob.createdAt]);

  const setBackendSession = (sessionId: string, expiresAt: string) => {
    setPrintJob(prev => ({
      ...prev,
      backendSessionId: sessionId,
      expiresAt,
    }));
  };

  const setPrintJobId = (printJobId: string) => {
    setPrintJob(prev => ({
      ...prev,
      printJobId,
    }));
  };

  const updateDocument = (doc: Partial<Document>) => {
    setPrintJob(prev => {
      const document = { ...prev.document, ...doc };
      return {
        ...prev,
        document,
        pricing: getPricing(prev.settings, document),
      };
    });
  };

  const updateSettings = (settings: Partial<Settings>) => {
    setPrintJob(prev => {
      const nextSettings = { ...prev.settings, ...settings };
      return {
        ...prev,
        settings: nextSettings,
        pricing: getPricing(nextSettings, prev.document),
      };
    });
  };

  const updatePricing = (pricing: Partial<Pricing>) => {
    setPrintJob(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...pricing },
    }));
  };

  const updatePayment = (payment: Partial<Payment>) => {
    setPrintJob(prev => ({
      ...prev,
      payment: { ...prev.payment, ...payment },
    }));
  };

  const updateStatus = (status: PrintJob['status']) => {
    setPrintJob(prev => ({ ...prev, status }));
  };

  const calculatePrice = () => {
    setPrintJob(prev => ({
      ...prev,
      pricing: getPricing(prev.settings, prev.document),
    }));
  };

  const resetJob = () => {
    setPrintJob(defaultPrintJob);
  };

  const setKiosk = (kioskId: string) => {
    setPrintJob(prev => ({
      ...prev,
      kioskId,
    }));
  };

  return (
    <PrintJobContext.Provider
      value={{
        printJob,
        updateDocument,
        updateSettings,
        updatePricing,
        updatePayment,
        updateStatus,
        calculatePrice,
        resetJob,
        setBackendSession,
        setPrintJobId,
        setKiosk,
      }}
    >
      {children}
    </PrintJobContext.Provider>
  );
}

export function usePrintJob() {
  const context = useContext(PrintJobContext);
  if (!context) {
    throw new Error('usePrintJob must be used within PrintJobProvider');
  }
  return context;
}
