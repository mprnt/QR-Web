'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { useEffect, useRef, useState, Suspense } from 'react';
import { createSession } from '@/lib/api/client';
import Link from 'next/link';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kioskIdParam = searchParams.get('kioskId');
  const { printJob, hydrated, setBackendSession, setKiosk, resetJob } = usePrintJob();
  const sessionRequestInFlight = useRef(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [kioskInfo, setKioskInfo] = useState<{
    kioskId: string;
    location: string;
    capabilities: any;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Create session in background when kioskId present
  // Wait for saved state first, so a reload reuses the session instead of
  // opening a second one. A session for a different kiosk is not reused.
  const sameKioskSession = !!printJob.backendSessionId && printJob.kioskId === kioskIdParam;

  useEffect(() => {
    if (!kioskIdParam || !hydrated) return;
    if (sameKioskSession || sessionRequestInFlight.current) {
      // Session already exists
      if (sameKioskSession) setSessionReady(true);
      return;
    }

    sessionRequestInFlight.current = true;

    async function initSession(kioskId: string) {
      try {
        const response = await createSession(kioskId);
        resetJob();
        setKiosk(kioskId);
        setBackendSession(response.data.sessionId, response.data.expiresAt, response.data.sessionToken);
        setKioskInfo(response.data.kioskInfo);
        setSessionReady(true);
        console.log('✓ Backend session created:', response.data.sessionId);
      } catch (err: any) {
        console.error('Failed to create session:', err);
        sessionRequestInFlight.current = false;
        setError(err.message || 'Failed to connect to printer. Please try scanning again.');
      }
    }

    initSession(kioskIdParam);
  }, [kioskIdParam, hydrated, sameKioskSession, setKiosk, setBackendSession, resetJob]);

  const handleStartPrinting = () => {
    setIsNavigating(true);
    router.push('/upload');
  };

  // Direct visit — no QR code scanned
  if (!kioskIdParam) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Brand */}
          <div className="mb-10 animate-on-scroll">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-text tracking-tight">
              M<span className="text-primary">Prnt</span>
            </h1>
            <p className="text-text-muted mt-2 text-lg">Self-service printing, simplified.</p>
          </div>

          {/* Scan instruction */}
          <div className="bg-surface-secondary rounded-2xl p-8 animate-on-scroll-scale" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Scan to Start</h2>
            <p className="text-text-muted">
              Scan the QR code on any MPrnt kiosk to begin printing your documents instantly.
            </p>
          </div>

          {/* T&C Link */}
          <div className="mt-8 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <Link href="/terms" className="text-sm text-text-muted hover:text-primary transition-colors underline underline-offset-2">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full mb-6 animate-on-scroll-pop">
            <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-text mb-3">Connection Failed</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main landing page after QR scan
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-0">
        <div className="max-w-md w-full text-center">
          {/* Brand Logo */}
          <div className="mb-8 animate-on-scroll">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-5 relative">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {/* Status dot */}
              {sessionReady && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-surface" />
              )}
            </div>
            <h1 className="text-5xl font-black text-text tracking-tight">
              M<span className="text-primary">Prnt</span>
            </h1>
            <p className="text-text-muted mt-2 text-lg">Print from your phone in seconds</p>
          </div>

          {/* Printer Info Card */}
          <div className="bg-surface-secondary rounded-2xl p-5 mb-6 animate-on-scroll" style={{ animationDelay: '0.08s' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-text">Kiosk {kioskIdParam}</h3>
                <p className="text-sm text-text-muted">
                  {kioskInfo?.location || 'Self-service printer'}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                sessionReady
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}>
                <span className={`w-2 h-2 rounded-full ${sessionReady ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                {sessionReady ? 'Ready' : 'Connecting'}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8 animate-on-scroll" style={{ animationDelay: '0.15s' }}>
            <div className="bg-surface-secondary rounded-xl p-3 text-center">
              <svg className="w-6 h-6 text-primary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs font-medium text-text-muted">PDF, PNG, JPG</p>
            </div>
            <div className="bg-surface-secondary rounded-xl p-3 text-center">
              <svg className="w-6 h-6 text-primary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-xs font-medium text-text-muted">Instant Print</p>
            </div>
            <div className="bg-surface-secondary rounded-xl p-3 text-center">
              <svg className="w-6 h-6 text-primary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs font-medium text-text-muted">Secure Pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 pt-0 pb-8 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleStartPrinting}
            disabled={!sessionReady || isNavigating}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {!sessionReady ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting to Printer...
              </>
            ) : isNavigating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting...
              </>
            ) : (
              <>
                Start Printing
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* T&C Link */}
          <p className="text-center mt-5 text-sm text-text-muted">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline underline-offset-2 font-medium">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LandingPageContent />
    </Suspense>
  );
}
