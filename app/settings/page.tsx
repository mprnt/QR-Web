'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { Counter } from '@/components/Counter';
import { OptionCard } from '@/components/OptionCard';
import { useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { printJob, updateSettings } = usePrintJob();

  useEffect(() => {
    if (!printJob.document.file) {
      router.push('/upload');
    }
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
              onClick={() => router.push('/preview')}
              className="flex items-center gap-2 text-text-muted hover:text-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer startTime={printJob.createdAt} />
          </div>
          <ProgressBar currentStep={3} totalSteps={5} />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-text">Print Settings</h1>
            <p className="text-text-muted mt-1">Step 3 of 5</p>
          </div>
        </div>
      </div>

      {/* Settings Area */}
      <div className="flex-1 px-3 sm:px-4 py-4 overflow-y-auto pb-48">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          {/* Color Mode */}
          <div className="animate-on-scroll">
            <h2 className="text-base sm:text-lg font-bold text-text mb-3 sm:mb-4">Color Mode</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                }
                title="Black & White"
                description="Standard printing"
                price="₹2/page"
                selected={printJob.settings.colorMode === 'bw'}
                onClick={() => updateSettings({ colorMode: 'bw' })}
              />
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                }
                title="Color"
                description="Full color printing"
                price="₹10/page"
                selected={printJob.settings.colorMode === 'color'}
                onClick={() => updateSettings({ colorMode: 'color' })}
              />
            </div>
          </div>

          {/* Number of Copies */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-base sm:text-lg font-bold text-text mb-3 sm:mb-4">Number of Copies</h2>
            <div className="bg-surface-secondary rounded-xl p-4 sm:p-6 flex items-center justify-center">
              <Counter
                value={printJob.settings.copies}
                onChange={(value) => updateSettings({ copies: value })}
                min={1}
                max={10}
              />
            </div>
          </div>

          {/* Paper Size */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-base sm:text-lg font-bold text-text mb-3 sm:mb-4">Paper Size</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="A4"
                description="210 × 297 mm"
                selected={printJob.settings.paperSize === 'a4'}
                onClick={() => updateSettings({ paperSize: 'a4' })}
              />
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="Letter"
                description="8.5 × 11 inches"
                selected={printJob.settings.paperSize === 'letter'}
                onClick={() => updateSettings({ paperSize: 'letter' })}
              />
            </div>
          </div>

          {/* Orientation */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-base sm:text-lg font-bold text-text mb-3 sm:mb-4">Orientation</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <OptionCard
                icon={
                  <div className="w-6 h-8 border-2 border-primary rounded"></div>
                }
                title="Portrait"
                description="Vertical layout"
                selected={printJob.settings.orientation === 'portrait'}
                onClick={() => updateSettings({ orientation: 'portrait' })}
              />
              <OptionCard
                icon={
                  <div className="w-8 h-6 border-2 border-primary rounded"></div>
                }
                title="Landscape"
                description="Horizontal layout"
                selected={printJob.settings.orientation === 'landscape'}
                onClick={() => updateSettings({ orientation: 'landscape' })}
              />
            </div>
          </div>

          {/* Print Sides */}
          <div className="animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-base sm:text-lg font-bold text-text mb-3 sm:mb-4">Print Sides</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="Single-Sided"
                description="Print on one side only"
                selected={printJob.settings.printSides === 'single'}
                onClick={() => updateSettings({ printSides: 'single' })}
              />
              <OptionCard
                icon={
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                }
                title="Double-Sided"
                description="Print on both sides"
                selected={printJob.settings.printSides === 'double'}
                onClick={() => updateSettings({ printSides: 'double' })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar with Price */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-text-muted">Estimated Cost</div>
              <div className="text-3xl font-bold text-text">₹{printJob.pricing.total}</div>
            </div>
            <div className="text-right text-sm text-text-muted">
              <div>{printJob.pricing.totalPages} pages</div>
              <div>₹{printJob.pricing.basePrice}/page</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/review')}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Continue to Review
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
