'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { useEffect, useState } from 'react';
import { getJobStatus } from '@/lib/api/client';
import { jobStatusWS } from '@/lib/websocket';

export default function ProcessingPage() {
  const router = useRouter();
  const { printJob, updateStatus } = usePrintJob();
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<string>('queued');
  const [error, setError] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling'>('polling');

  useEffect(() => {
    if (!printJob.document.file || printJob.payment.status !== 'success') {
      router.push('/');
      return;
    }

    if (!printJob.printJobId) {
      setError('Print job ID not found');
      return;
    }

    let isActive = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let wsUnsubscribe: (() => void) | null = null;

    const updateJobProgress = (status: string, data?: any) => {
      if (!isActive) return;

      setJobStatus(status);
      setError(null);

      let newProgress = 0;
      switch (status) {
        case 'queued':
          newProgress = 10;
          break;
        case 'assigned':
          newProgress = 30;
          break;
        case 'printing':
          newProgress = 60 + (data?.printedPages ? Math.min(data.printedPages * 5, 35) : 0);
          break;
        case 'completed':
          newProgress = 100;
          break;
        case 'failed':
          setError(data?.errorMessage || 'Printing failed');
          return;
        case 'cancelled':
          setError('Print job was cancelled');
          return;
      }

      setProgress(newProgress);

      if (status === 'completed' && isActive) {
        updateStatus('complete');
        // Clean up before redirect
        if (wsUnsubscribe) wsUnsubscribe();
        if (pollInterval) clearInterval(pollInterval);
        jobStatusWS.disconnect();

        setTimeout(() => {
          router.push('/complete');
        }, 500);
      }
    };

    const initializeWebSocket = async () => {
      try {
        await jobStatusWS.subscribe(printJob.printJobId!);
        setConnectionType('websocket');
        console.log('✓ WebSocket connected for real-time updates');

        // Listen for status updates
        wsUnsubscribe = jobStatusWS.onStatusUpdate((status, data) => {
          updateJobProgress(status, data);
        });
      } catch (error) {
        console.warn('WebSocket connection failed, falling back to polling', error);
        setConnectionType('polling');
        initializePolling();
      }
    };

    const pollJobStatus = async () => {
      try {
        const status = await getJobStatus(printJob.printJobId!);
        updateJobProgress(status.status, status);
      } catch (err: any) {
        if (!isActive) return;
        console.error('Error polling job status:', err);
        setError('Failed to get job status: ' + (err.message || 'Unknown error'));
      }
    };

    const initializePolling = () => {
      pollJobStatus();
      pollInterval = setInterval(pollJobStatus, 2000);
    };

    // Try WebSocket first, fall back to polling
    initializeWebSocket();

    return () => {
      isActive = false;
      if (wsUnsubscribe) wsUnsubscribe();
      if (pollInterval) clearInterval(pollInterval);
      jobStatusWS.disconnect();
    };
  }, [printJob.document.file, printJob.payment.status, printJob.printJobId, router, updateStatus]);

  const getStatusMessage = () => {
    if (error) return 'Error!';
    switch (jobStatus) {
      case 'queued':
        return 'Waiting in queue...';
      case 'assigned':
        return 'Preparing document...';
      case 'printing':
        return 'Printing...';
      case 'completed':
        return 'Done!';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center animate-on-scroll">
          {/* Animated Printer Icon */}
          <div className={`inline-flex items-center justify-center w-32 h-32 ${error ? 'bg-error/10' : 'bg-primary/10'} rounded-full mb-8 relative`}>
            <svg className={`w-16 h-16 ${error ? 'text-error' : 'text-primary'} ${error ? '' : 'animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {error ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              )}
            </svg>
            {!error && <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>}
          </div>

          <h1 className={`text-4xl font-black ${error ? 'text-error' : 'text-text'} mb-4`}>
            {getStatusMessage()}
          </h1>

          <p className="text-xl text-text-muted mb-8">
            {error ? error : 'Please wait while we prepare your prints'}
          </p>

          {/* Progress Bar */}
          {!error && (
            <div className="max-w-md mx-auto mb-8">
              <div className="w-full bg-surface-secondary h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-text-muted mt-2">{progress}%</p>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-surface-secondary rounded-xl p-6 max-w-md mx-auto">
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Status</span>
                <span className="font-semibold text-text capitalize">{jobStatus}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Connection</span>
                <span className="font-semibold text-text text-sm flex items-center gap-1">
                  {connectionType === 'websocket' ? (
                    <>
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                      Real-time
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-warning rounded-full"></span>
                      Polling
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Document</span>
                <span className="font-semibold text-text text-sm truncate ml-4 max-w-[200px]">
                  {printJob.document.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Pages</span>
                <span className="font-semibold text-text">{printJob.pricing.totalPages}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-muted">Kiosk</span>
                <span className="font-semibold text-text">{printJob.kioskId}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-muted">Transaction ID</span>
                <span className="font-semibold text-text text-sm">{printJob.payment.transactionId}</span>
              </div>
            </div>
          </div>

          {/* Warning/Error Message */}
          <div className={`mt-8 ${error ? 'bg-error/10 border-error/20' : 'bg-warning/10 border-warning/20'} border rounded-lg p-4 max-w-md mx-auto`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 ${error ? 'text-error' : 'text-warning'} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className={`text-sm ${error ? 'text-error' : 'text-warning'} text-left`}>
                {error ? 'An error occurred during printing.' : 'Please stay on this page. Do not close or refresh your browser.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
