'use client';

import { useRouter } from 'next/navigation';
import { homeHref, usePrintJob } from '@/context/PrintJobContext';
import { chargedAmount } from '@/lib/jobState';
import { useEffect } from 'react';

export default function CompletePage() {
  const router = useRouter();
  const { printJob, hydrated, resetJob } = usePrintJob();

  useEffect(() => {
    if (hydrated && printJob.status !== 'complete') {
      router.push(homeHref(printJob.kioskId));
    }
  }, [hydrated, printJob.status, printJob.kioskId, router]);

  // Back to the same kiosk, so the customer does not have to rescan.
  const handleNewPrint = () => {
    const href = homeHref(printJob.kioskId);
    resetJob();
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center animate-on-scroll">
          {/* Success Animation */}
          <div className="inline-flex items-center justify-center w-32 h-32 bg-success/10 rounded-full mb-8 animate-on-scroll-pop">
            <svg className="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-5xl font-black text-text mb-4">
            Print Complete!
          </h1>

          <p className="text-xl text-text-muted mb-8">
            Your documents are ready for collection
          </p>

          {/* Collection Instructions */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 mb-8 animate-on-scroll-scale" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text">Kiosk {printJob.kioskId}</h2>
                <p className="text-text-muted">Collection Point</p>
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-lg font-bold text-primary mb-1">
                Please collect your prints from the output tray
              </p>
              <p className="text-sm text-text-muted">
                Look for the tray marked &quot;{printJob.kioskId}&quot; on the right side
              </p>
            </div>
          </div>

          {/* Print Details */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-text mb-4">Print Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Document</span>
                <span className="font-semibold text-text text-sm truncate ml-4 max-w-[250px]">
                  {printJob.document.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Pages Printed</span>
                <span className="font-semibold text-text">{printJob.pricing.totalPages}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Copies</span>
                <span className="font-semibold text-text">{printJob.settings.copies}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Amount Paid</span>
                <span className="font-semibold text-primary">₹{chargedAmount(printJob) ?? printJob.pricing.total}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Transaction ID</span>
                <span className="font-semibold text-text text-sm">{printJob.payment.transactionId}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-on-scroll" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleNewPrint}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Print Another Document
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-surface-secondary border border-border text-text rounded-xl font-semibold transition-all hover:border-primary"
            >
              Finish
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 space-y-2 text-sm text-text-muted animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            {printJob.payment.transactionId && <p>Transaction ID: {printJob.payment.transactionId}</p>}
            <p>Thank you for using MPrnt!</p>
          </div>

          {/* Rating/Feedback Section */}
          <div className="mt-8 p-6 bg-surface-secondary rounded-xl animate-on-scroll" style={{ animationDelay: '0.5s' }}>
            <p className="text-text-muted mb-3">How was your experience?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="w-12 h-12 rounded-lg bg-surface border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
