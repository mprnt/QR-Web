'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  applyDocument,
  applySettings,
  defaultPrintJob,
  fromStored,
  getPricing,
  mergeServerSession,
  STORAGE_KEY,
  toStored,
  type Document,
  type JobPricing,
  type Payment,
  type Pricing,
  type PrintJob,
  type Settings,
} from '@/lib/jobState';
import { getKioskRates, getSession, setSessionToken } from '@/lib/api/client';

export type { Document, JobPricing, Payment, Pricing, PrintJob, Settings } from '@/lib/jobState';

interface PrintJobContextType {
  printJob: PrintJob;
  /** False until saved state has been read back after a page load. Guards wait for it. */
  hydrated: boolean;
  updateDocument: (doc: Partial<Document>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updatePricing: (pricing: Partial<Pricing>) => void;
  updatePayment: (payment: Partial<Payment>) => void;
  updateStatus: (status: PrintJob['status']) => void;
  calculatePrice: () => void;
  resetJob: () => void;
  setBackendSession: (sessionId: string, expiresAt: string, sessionToken?: string) => void;
  setPrintJobId: (printJobId: string, pricing?: JobPricing) => void;
  setKiosk: (kioskId: string) => void;
}

const PrintJobContext = createContext<PrintJobContextType | undefined>(undefined);

function readStored(): PrintJob | null {
  try {
    return fromStored(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(job: PrintJob) {
  try {
    if (job.backendSessionId) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStored(job)));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Private mode or storage full: the app still works, it just cannot survive a reload.
  }
}

export function PrintJobProvider({ children }: { children: ReactNode }) {
  const [printJob, setPrintJob] = useState<PrintJob>(defaultPrintJob);
  const [hydrated, setHydrated] = useState(false);
  const hydrating = useRef(false);

  // Restore after a reload, then let the backend correct what it knows better
  // (expiry, and above all whether the job was paid while the page was away).
  useEffect(() => {
    if (hydrating.current) return;
    hydrating.current = true;

    const stored = readStored();
    if (stored) {
      setSessionToken(stored.sessionToken);
      setPrintJob(stored);
    }
    setHydrated(true);

    if (stored?.backendSessionId) {
      getSession(stored.backendSessionId)
        .then((server) => setPrintJob((prev) => mergeServerSession(prev, server)))
        .catch((err) => console.warn('Could not refresh session from backend', err));
    }
  }, []);

  useEffect(() => {
    if (printJob.createdAt !== 0) return;

    const createdAt = Date.now();
    setPrintJob(prev => ({
      ...prev,
      sessionId: `S${createdAt}`,
      createdAt,
    }));
  }, [printJob.createdAt]);

  useEffect(() => {
    if (hydrated) writeStored(printJob);
  }, [hydrated, printJob]);

  useEffect(() => {
    setSessionToken(printJob.sessionToken);
  }, [printJob.sessionToken]);

  // Prices are set per kiosk from the admin dashboard, so fetch them rather
  // than assume them. The estimate is recomputed as soon as they arrive.
  useEffect(() => {
    if (!hydrated || !printJob.kioskId) return;
    let cancelled = false;
    getKioskRates(printJob.kioskId)
      .then((rates) => {
        if (cancelled) return;
        setPrintJob(prev => ({
          ...prev,
          rates,
          pricing: getPricing(prev.settings, prev.document, rates),
        }));
      })
      .catch((err) => console.warn('Could not load kiosk prices', err));
    return () => {
      cancelled = true;
    };
  }, [hydrated, printJob.kioskId]);

  const setBackendSession = useCallback((sessionId: string, expiresAt: string, sessionToken?: string) => {
    // Set synchronously too, so a call made right after this one is authorised.
    setSessionToken(sessionToken);
    setPrintJob(prev => ({
      ...prev,
      backendSessionId: sessionId,
      sessionToken,
      expiresAt,
    }));
  }, []);

  const setPrintJobId = useCallback((printJobId: string, pricing?: JobPricing) => {
    setPrintJob(prev => ({
      ...prev,
      printJobId,
      jobPricing: pricing,
      jobStale: undefined,
    }));
  }, []);

  const updateDocument = useCallback((doc: Partial<Document>) => {
    setPrintJob(prev => applyDocument(prev, doc));
  }, []);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setPrintJob(prev => applySettings(prev, settings));
  }, []);

  const updatePricing = useCallback((pricing: Partial<Pricing>) => {
    setPrintJob(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...pricing },
    }));
  }, []);

  const updatePayment = useCallback((payment: Partial<Payment>) => {
    setPrintJob(prev => ({
      ...prev,
      payment: { ...prev.payment, ...payment },
    }));
  }, []);

  const updateStatus = useCallback((status: PrintJob['status']) => {
    setPrintJob(prev => ({ ...prev, status }));
  }, []);

  const calculatePrice = useCallback(() => {
    setPrintJob(prev => ({
      ...prev,
      pricing: getPricing(prev.settings, prev.document, prev.rates),
    }));
  }, []);

  // Keeps the kiosk so "print another" / "start over" can go straight back to it.
  const resetJob = useCallback(() => {
    setSessionToken(null);
    setPrintJob(prev => ({ ...defaultPrintJob, kioskId: prev.kioskId, rates: prev.rates }));
  }, []);

  const setKiosk = useCallback((kioskId: string) => {
    setPrintJob(prev => ({
      ...prev,
      kioskId,
    }));
  }, []);

  return (
    <PrintJobContext.Provider
      value={{
        printJob,
        hydrated,
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

/** Where to send someone who has no usable session: back to their kiosk if known. */
export function homeHref(kioskId: string | undefined): string {
  return kioskId ? `/?kioskId=${encodeURIComponent(kioskId)}` : '/';
}
