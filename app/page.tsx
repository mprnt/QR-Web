'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { useEffect, useRef, Suspense } from 'react';
import { createSession } from '@/lib/api/client';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kioskIdParam = searchParams.get('kioskId');
  const { printJob, setBackendSession, setKiosk } = usePrintJob();
  const sessionRequestInFlight = useRef(false);

  // If kioskId is provided (from QR scan), auto-create session and redirect to upload
  useEffect(() => {
    if (!kioskIdParam) {
      return;
    }

    if (printJob.backendSessionId || sessionRequestInFlight.current) {
      return;
    }

    sessionRequestInFlight.current = true;
    handleCreateSession(kioskIdParam);
  }, [kioskIdParam, printJob.backendSessionId]);

  const handleCreateSession = async (kioskId: string) => {
    try {
      const response = await createSession(kioskId);
      setKiosk(kioskId);
      setBackendSession(response.data.sessionId, response.data.expiresAt);
      console.log('✓ Backend session created:', response.data.sessionId);

      // Redirect to upload page (skip landing page entirely)
      setTimeout(() => {
        router.push('/upload');
      }, 100);
    } catch (err: any) {
      console.error('Failed to create session:', err);
      sessionRequestInFlight.current = false;
    }
  };

  // Loading state while session is being created
  if (kioskIdParam) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 animate-pulse">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-text-muted">Starting print session...</p>
        </div>
      </div>
    );
  }

  // This shouldn't show if QR code is scanned, but fallback for direct visits
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-black text-text mb-4">MPrnt</h1>
        <p className="text-xl text-text-muted">Scan the QR code on any printer to start printing</p>
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
