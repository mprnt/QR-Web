'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PreviewPage() {
  const router = useRouter();
  const { printJob } = usePrintJob();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(600);

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 64, 600);
      setPageWidth(width);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  useEffect(() => {
    if (!printJob.document.file) {
      router.push('/upload');
      return;
    }

    const url = URL.createObjectURL(printJob.document.file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [printJob.document.file, router]);

  if (!printJob.document.file) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/upload')}
              className="flex items-center gap-2 text-text-muted hover:text-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer startTime={printJob.createdAt} />
          </div>
          <ProgressBar currentStep={2} totalSteps={5} />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-text">Preview Document</h1>
            <p className="text-text-muted mt-1">Step 2 of 5</p>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Document Info Card */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-6 animate-on-scroll">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text mb-1">{printJob.document.name}</h3>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span>{printJob.document.pages} pages</span>
                  <span>•</span>
                  <span>{(printJob.document.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="space-y-4 animate-on-scroll-scale" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border flex justify-center">
              {printJob.document.file.type === 'application/pdf' ? (
                <Document
                  file={printJob.document.file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="aspect-[8.5/11] flex items-center justify-center text-text-muted min-h-[400px]">Loading PDF...</div>}
                  className="max-w-full"
                >
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                  />
                </Document>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Preview of ${printJob.document.name}`}
                  className="w-full aspect-[8.5/11] object-contain"
                />
              ) : (
                <div className="aspect-[8.5/11] flex items-center justify-center text-text-muted min-h-[400px]">
                  Preparing preview...
                </div>
              )}
            </div>

            {/* Page Navigation */}
            {(numPages || printJob.document.pages) > 1 && printJob.document.file.type === 'application/pdf' && (
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text hover:border-primary transition-all disabled:opacity-30 disabled:hover:border-border cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-text-muted">{pageNumber} / {numPages || printJob.document.pages}</span>
                <button 
                  onClick={nextPage}
                  disabled={pageNumber >= (numPages || 1)}
                  className="px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text hover:border-primary transition-all disabled:opacity-30 disabled:hover:border-border cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Fallback for non-PDFs */}
            {printJob.document.file.type !== 'application/pdf' && printJob.document.pages > 1 && (
               <div className="flex items-center justify-center gap-4">
                 <button className="px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text hover:border-primary transition-all disabled:opacity-30" disabled>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <span className="text-text-muted">1 / {printJob.document.pages}</span>
                 <button className="px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text hover:border-primary transition-all disabled:opacity-30" disabled>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
