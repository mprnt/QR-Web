'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIError,
  createPrintJob,
  createSession,
  PrintSettings,
  updatePrintJobSettings,
  uploadDocument,
} from '@/lib/api/client';
import { needsJobSync, type JobPricing } from '@/lib/jobState';

function toJobPricing(pricing: { pricePerPage: number; totalPages: number; totalAmount: number }): JobPricing {
  return {
    pricePerPage: pricing.pricePerPage,
    totalPages: pricing.totalPages,
    totalAmount: pricing.totalAmount,
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const { printJob, hydrated, setPrintJobId, setBackendSession, updateDocument } = usePrintJob();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [needsReupload, setNeedsReupload] = useState(false);
  const syncing = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const hasDocument = !!printJob.document.documentId;
  const paid = printJob.payment.status === 'success';

  useEffect(() => {
    if (!hydrated) return;
    if (paid) router.replace('/processing');
    else if (!hasDocument) router.push('/upload');
  }, [hydrated, hasDocument, paid, router]);

  /**
   * Make the backend job match what the customer chose, so the price shown
   * here is the backend's. The backend holds one job per session: settings
   * changes PATCH it, and once a payment order exists the job is locked, so
   * the document goes to a fresh session with a new job instead.
   */
  const syncJob = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    setIsSyncing(true);
    setSyncError(null);
    setNeedsReupload(false);

    const settings: PrintSettings = {
      colorMode: printJob.settings.colorMode,
      copies: printJob.settings.copies,
      pageRange: printJob.settings.pageRange,
      customRange: printJob.settings.pageRange === 'custom' ? printJob.settings.customRange : undefined,
      printSides: printJob.settings.printSides,
      paperSize: printJob.settings.paperSize,
      orientation: printJob.settings.orientation,
    };

    try {
      const sessionId = printJob.backendSessionId;
      if (!sessionId) throw new Error('Your session has ended. Please scan the kiosk QR code again.');

      if (!printJob.printJobId) {
        const job = await createPrintJob(sessionId, settings);
        setPrintJobId(job.jobId, toJobPricing(job.pricing));
        return;
      }

      try {
        const job = await updatePrintJobSettings(printJob.printJobId, settings);
        setPrintJobId(job.jobId, toJobPricing(job.pricing));
        return;
      } catch (err) {
        if (!(err instanceof APIError && err.code === 'JOB_SETTINGS_LOCKED')) throw err;
      }

      // Locked: a payment order already exists for the old settings.
      const file = printJob.document.file;
      if (!file) {
        setNeedsReupload(true);
        throw new Error('Your print settings changed after payment was started. Please upload your document again.');
      }
      const fresh = await createSession(printJob.kioskId);
      setBackendSession(fresh.data.sessionId, fresh.data.expiresAt, fresh.data.sessionToken);
      const doc = await uploadDocument(fresh.data.sessionId, file);
      updateDocument({
        documentId: doc.documentId,
        pages: Math.max(1, doc.pageCount || 1),
        fileType: doc.fileType,
        processed: doc.processed,
      });
      const job = await createPrintJob(fresh.data.sessionId, settings);
      setPrintJobId(job.jobId, toJobPricing(job.pricing));
    } catch (error: any) {
      console.error('Failed to prepare print job:', error);
      setSyncError(error?.message || 'Could not confirm the price. Please try again.');
    } finally {
      syncing.current = false;
      setIsSyncing(false);
    }
  }, [printJob, setPrintJobId, setBackendSession, updateDocument]);

  const shouldSync = hydrated && hasDocument && !paid && needsJobSync(printJob);

  useEffect(() => {
    if (shouldSync && !syncError) syncJob();
  }, [shouldSync, syncError, syncJob]);

  if (!hasDocument) {
    return null;
  }

  const jobPricing = needsJobSync(printJob) ? undefined : printJob.jobPricing;

  const settingsDisplay = [
    { label: 'Color Mode', value: printJob.settings.colorMode === 'bw' ? 'Black & White' : 'Color' },
    { label: 'Copies', value: printJob.settings.copies },
    {
      label: 'Page Range',
      value:
        printJob.settings.pageRange === 'custom' && printJob.settings.customRange
          ? printJob.settings.customRange
          : `All (${printJob.document.pages})`,
    },
    { label: 'Paper Size', value: printJob.settings.paperSize.toUpperCase() },
    { label: 'Orientation', value: printJob.settings.orientation.charAt(0).toUpperCase() + printJob.settings.orientation.slice(1) },
    { label: 'Print Sides', value: printJob.settings.printSides === 'single' ? 'Single-Sided' : 'Double-Sided' },
  ];

  const handleProceedToPayment = () => {
    if (!jobPricing || isSyncing) return;
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer />
          </div>
          <ProgressBar currentStep={4} totalSteps={5} />
          <div className="text-center mt-3">
            <h1 className="text-2xl font-bold text-text">Review & Confirm</h1>
            <p className="text-text-muted mt-0.5 text-sm">Step 4 of 5</p>
          </div>
        </div>
      </div>

      {/* Review Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-48">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Document Summary */}
          <div className="bg-surface-secondary rounded-xl p-6 animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Document</h2>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">{printJob.document.name}</h3>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span>{printJob.document.pages} pages</span>
                  <span>•</span>
                  <span>{(printJob.document.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-surface-secondary rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Print Settings</h2>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-primary font-medium hover:underline"
              >
                Change
              </button>
            </div>
            <div className="space-y-3">
              {settingsDisplay.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="font-semibold text-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-surface-secondary rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-bold text-text mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Base Price per Page</span>
                <span className="font-semibold text-text">₹{jobPricing ? jobPricing.pricePerPage : printJob.pricing.basePrice}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Total Pages</span>
                <span className="font-semibold text-text">{jobPricing ? jobPricing.totalPages : printJob.pricing.totalPages}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t-2 border-border">
                {jobPricing ? (
                  <>
                    <span className="text-lg font-bold text-text">Total Cost</span>
                    <span className="text-2xl font-bold text-primary">₹{jobPricing.totalAmount}</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-text">
                      Estimated Cost
                      <span className="block text-xs font-normal text-text-muted">
                        {isSyncing ? 'Confirming final price…' : 'Final price not confirmed yet'}
                      </span>
                    </span>
                    <span className="text-2xl font-bold text-text-muted">₹{printJob.pricing.total}</span>
                  </>
                )}
              </div>
              {syncError && (
                <div role="alert" className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-text">
                  <p>{syncError}</p>
                  <button
                    onClick={() => (needsReupload ? router.push('/upload') : setSyncError(null))}
                    className="mt-2 text-primary font-medium hover:underline"
                  >
                    {needsReupload ? 'Upload again' : 'Try again'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Kiosk Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">Collection Point</h3>
                <p className="text-sm text-text-muted">
                  Your prints will be ready at Kiosk {printJob.kioskId} in approximately 60 seconds after payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-warning">
              Please review your order carefully. Once payment is confirmed, changes cannot be made.
            </p>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={isSyncing || !jobPricing}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming price...
              </>
            ) : (
              <>
                {jobPricing ? `Proceed to Payment (₹${jobPricing.totalAmount})` : 'Proceed to Payment'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
