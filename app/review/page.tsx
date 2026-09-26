'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useEffect, useState } from 'react';
import { createPrintJob, PrintSettings } from '@/lib/api/client';

export default function ReviewPage() {
  const router = useRouter();
  const { printJob, setPrintJobId } = usePrintJob();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!printJob.document.file) {
      router.push('/upload');
    }
  }, [printJob.document.file, router]);

  if (!printJob.document.file) {
    return null;
  }

  const settingsDisplay = [
    { label: 'Color Mode', value: printJob.settings.colorMode === 'bw' ? 'Black & White' : 'Color' },
    { label: 'Copies', value: printJob.settings.copies },
    { label: 'Paper Size', value: printJob.settings.paperSize.toUpperCase() },
    { label: 'Orientation', value: printJob.settings.orientation.charAt(0).toUpperCase() + printJob.settings.orientation.slice(1) },
    { label: 'Print Sides', value: printJob.settings.printSides === 'single' ? 'Single-Sided' : 'Double-Sided' },
  ];

  const handleProceedToPayment = async () => {
    if (isCreating) return;

    // If print job already exists, just navigate
    if (printJob.printJobId) {
      router.push('/payment');
      return;
    }

    setIsCreating(true);

    try {
      const sessionId = printJob.backendSessionId || printJob.sessionId;

      const settings: PrintSettings = {
        colorMode: printJob.settings.colorMode,
        copies: printJob.settings.copies,
        pageRange: printJob.settings.pageRange,
        customRange: printJob.settings.customRange,
        printSides: printJob.settings.printSides,
        paperSize: printJob.settings.paperSize,
        orientation: printJob.settings.orientation,
      };

      const job = await createPrintJob(sessionId, settings);

      console.log('✓ Print job created:', job.jobId);
      console.log('  Total amount: ₹', job.pricing.totalAmount);
      console.log('  Pages:', job.pricing.totalPages);

      setPrintJobId(job.jobId);
      router.push('/payment');
    } catch (error: any) {
      console.error('Failed to create print job:', error);
      alert('Failed to create print job: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 text-text-muted hover:text-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer startTime={printJob.createdAt} />
          </div>
          <ProgressBar currentStep={4} totalSteps={5} />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-text">Review & Confirm</h1>
            <p className="text-text-muted mt-1">Step 4 of 5</p>
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
          <div className="bg-surface-secondary rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.1s' }}>
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
          <div className="bg-surface-secondary rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-bold text-text mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Base Price per Page</span>
                <span className="font-semibold text-text">₹{printJob.pricing.basePrice}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Total Pages</span>
                <span className="font-semibold text-text">{printJob.pricing.totalPages}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t-2 border-border">
                <span className="text-lg font-bold text-text">Total Cost</span>
                <span className="text-2xl font-bold text-primary">₹{printJob.pricing.total}</span>
              </div>
            </div>
          </div>

          {/* Kiosk Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 animate-on-scroll" style={{ animationDelay: '0.3s' }}>
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
            disabled={isCreating}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Print Job...
              </>
            ) : (
              <>
                Proceed to Payment (₹{printJob.pricing.total})
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
