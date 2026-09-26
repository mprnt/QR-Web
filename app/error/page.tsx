'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { Suspense } from 'react';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetJob } = usePrintJob();

  const reason = searchParams.get('reason') || 'unknown';

  const getErrorDetails = () => {
    switch (reason) {
      case 'timeout':
        return {
          icon: (
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Session Timeout',
          message: 'Your session has expired due to inactivity.',
          suggestion: 'Please start a new print session.',
        };
      case 'payment_failed':
        return {
          icon: (
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
          title: 'Payment Failed',
          message: 'We could not process your payment.',
          suggestion: 'Please try again or use a different payment method.',
        };
      case 'upload_error':
        return {
          icon: (
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: 'Upload Failed',
          message: 'There was a problem uploading your document.',
          suggestion: 'Please check your file and try again.',
        };
      case 'printer_error':
        return {
          icon: (
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          ),
          title: 'Printer Error',
          message: 'The printer encountered an issue.',
          suggestion: 'Please contact staff for assistance.',
        };
      default:
        return {
          icon: (
            <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred.',
          suggestion: 'Please try again or contact support if the issue persists.',
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleStartOver = () => {
    resetJob();
    router.push('/');
  };

  const handleGetHelp = () => {
    alert('Please contact the kiosk support team or scan the help QR code on the machine.');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center animate-on-scroll">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-32 h-32 bg-error/10 rounded-full mb-8 animate-on-scroll-pop">
            {errorDetails.icon}
          </div>

          <h1 className="text-4xl font-black text-text mb-4">
            {errorDetails.title}
          </h1>

          <p className="text-xl text-text-muted mb-3">
            {errorDetails.message}
          </p>

          <p className="text-lg text-text mb-8">
            {errorDetails.suggestion}
          </p>

          {/* Error Details Card */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 max-w-md mx-auto animate-on-scroll-scale" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-text mb-1">Need Help?</h3>
                <p className="text-sm text-text-muted">
                  If you continue to experience issues, please contact our support team or ask for assistance from nearby staff.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 max-w-md mx-auto animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleStartOver}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Over
            </button>

            <button
              onClick={handleGetHelp}
              className="w-full py-4 bg-surface-secondary border border-border text-text rounded-xl font-semibold transition-all hover:border-primary"
            >
              Get Help
            </button>

            <button
              onClick={() => router.back()}
              className="w-full py-3 text-text-muted hover:text-text transition-all"
            >
              Go Back
            </button>
          </div>

          {/* Error Code */}
          {reason !== 'unknown' && (
            <div className="mt-8 text-sm text-text-muted animate-on-scroll" style={{ animationDelay: '0.3s' }}>
              <p>Error Code: {reason.toUpperCase()}</p>
              <p className="mt-1">Time: {new Date().toLocaleString()}</p>
            </div>
          )}

          {/* Help Resources */}
          <div className="mt-8 p-6 bg-surface-secondary rounded-xl animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-bold text-text mb-4">Common Solutions</h3>
            <div className="space-y-3 text-left text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-text-muted">Check your internet connection and try again</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-text-muted">Ensure your file is in a supported format (PDF, PNG, JPEG)</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-text-muted">Make sure your file is under 10MB in size</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-text-muted">If the issue persists, try using a different device</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
