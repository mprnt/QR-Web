'use client';

import { useRouter } from 'next/navigation';
import { homeHref, usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useState, useRef, useEffect } from 'react';
import { createSession, uploadDocument } from '@/lib/api/client';

export default function UploadPage() {
  const router = useRouter();
  const { updateDocument, printJob, hydrated, setBackendSession } = usePrintJob();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploading needs a real backend session; without one, go back and get one.
  useEffect(() => {
    if (hydrated && !printJob.backendSessionId) {
      router.replace(homeHref(printJob.kioskId));
    }
  }, [hydrated, printJob.backendSessionId, printJob.kioskId, router]);

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload PDF, PNG, or JPEG files only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let sessionId = printJob.backendSessionId;
      if (!sessionId) throw new Error('Your session has ended. Please scan the kiosk QR code again.');

      // The backend holds one document (and one print job) per session, so a
      // different file needs a fresh session at the same kiosk.
      if (printJob.document.documentId) {
        const fresh = await createSession(printJob.kioskId);
        setBackendSession(fresh.data.sessionId, fresh.data.expiresAt, fresh.data.sessionToken);
        sessionId = fresh.data.sessionId;
      }

      const document = await uploadDocument(sessionId, file, setProgress);

      console.log('✓ Document uploaded:', document.documentId);

      updateDocument({
        file,
        name: file.name,
        pages: Math.max(1, document.pageCount || 1),
        size: file.size,
        documentId: document.documentId,
        fileType: document.fileType,
        processed: document.processed,
      });

      setUploading(false);
      router.push('/preview');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer />
          </div>
          <ProgressBar currentStep={1} totalSteps={5} />
          <div className="text-center mt-3">
            <h1 className="text-2xl font-bold text-text">Upload Document</h1>
            <p className="text-text-muted mt-0.5 text-sm">Step 1 of 5</p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full animate-on-scroll-scale">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-surface-secondary'
            }`}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl animate-pulse">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-text">Uploading...</p>
                <div className="w-full max-w-xs mx-auto bg-border/40 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-text-muted font-medium">{progress.toFixed(0)}%</p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-5">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-text mb-1.5">
                  Drop your file here
                </h2>
                <p className="text-text-muted mb-6">
                  or tap below to browse
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.97]"
                >
                  Browse Files
                </button>

                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    PDF, PNG, JPEG
                  </div>
                  <span className="text-border">•</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Max 10MB
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
