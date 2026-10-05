'use client';

import { useRouter } from 'next/navigation';
import { usePrintJob } from '@/context/PrintJobContext';
import { ProgressBar } from '@/components/ProgressBar';
import { SessionTimer } from '@/components/SessionTimer';
import { useEffect } from 'react';

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

// Label on the left, compact toggle group on the right — one row per setting.
function SegmentedRow<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-text-muted">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex p-1 rounded-xl bg-surface-secondary border border-border">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                selected ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { printJob, updateSettings, hydrated } = usePrintJob();
  const { settings, document, pricing } = printJob;

  const hasDocument = !!printJob.document.documentId;

  useEffect(() => {
    if (hydrated && !hasDocument) {
      router.push('/upload');
    }
  }, [hydrated, hasDocument, router]);

  if (!hasDocument) {
    return null;
  }

  const colorOptions = [
    { value: 'bw' as const, label: 'B&W', price: '₹2 / page', swatch: 'bg-text' },
    { value: 'color' as const, label: 'Colour', price: '₹10 / page', swatch: 'bg-gradient-to-br from-amber-500 via-red-500 to-primary' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/preview')}
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <SessionTimer />
          </div>
          <ProgressBar currentStep={3} totalSteps={5} />
          <div className="text-center mt-3">
            <h1 className="text-2xl font-bold text-text">Print Settings</h1>
            <p className="text-text-muted mt-0.5 text-sm">Step 3 of 5</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 px-4 py-5 overflow-y-auto pb-52">
        <div className="max-w-2xl mx-auto animate-on-scroll">
          {/* Colour mode */}
          <div role="radiogroup" aria-label="Colour mode" className="grid grid-cols-2 gap-3 mb-3">
            {colorOptions.map((o) => {
              const selected = settings.colorMode === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateSettings({ colorMode: o.value })}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-left transition-all ${
                    selected ? 'border-2 border-primary bg-primary/10' : 'border border-border hover:border-primary/40'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex-shrink-0 ${o.swatch}`} />
                  <span>
                    <span className="block font-bold text-text leading-tight">{o.label}</span>
                    <span className="block text-sm text-text-muted">{o.price}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-border/60">
            {/* Copies */}
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-text-muted">Copies</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Fewer copies"
                  onClick={() => updateSettings({ copies: Math.max(1, settings.copies - 1) })}
                  disabled={settings.copies <= 1}
                  className="w-9 h-9 rounded-lg border border-border text-lg font-bold text-text flex items-center justify-center hover:border-primary disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-6 text-center text-lg font-bold text-text" aria-live="polite">
                  {settings.copies}
                </span>
                <button
                  type="button"
                  aria-label="More copies"
                  onClick={() => updateSettings({ copies: Math.min(10, settings.copies + 1) })}
                  disabled={settings.copies >= 10}
                  className="w-9 h-9 rounded-lg border border-border text-lg font-bold text-text flex items-center justify-center hover:border-primary disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Page range */}
            <div>
              <SegmentedRow
                label="Page range"
                value={settings.pageRange}
                options={[
                  { value: 'all', label: `All (${document.pages})` },
                  { value: 'custom', label: 'Custom' },
                ]}
                onChange={(pageRange) => updateSettings({ pageRange })}
              />
              {settings.pageRange === 'custom' && (
                <div className="pb-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={settings.customRange ?? ''}
                    onChange={(e) => updateSettings({ customRange: e.target.value })}
                    placeholder={`e.g. 1-3, 5 (of ${document.pages})`}
                    aria-label="Pages to print"
                    className="w-full px-4 py-3 rounded-xl bg-surface-secondary border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}
            </div>

            <SegmentedRow
              label="Paper size"
              value={settings.paperSize}
              options={[
                { value: 'a4', label: 'A4' },
                { value: 'letter', label: 'Letter' },
              ]}
              onChange={(paperSize) => updateSettings({ paperSize })}
            />

            <SegmentedRow
              label="Orientation"
              value={settings.orientation}
              options={[
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
              onChange={(orientation) => updateSettings({ orientation })}
            />

            <SegmentedRow
              label="Sides"
              value={settings.printSides}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'double', label: 'Double' },
              ]}
              onChange={(printSides) => updateSettings({ printSides })}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar: estimate + continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 mb-3">
            <div>
              <div className="text-sm text-text-muted">Estimated cost</div>
              <div className="text-sm text-text-muted">
                {pricing.totalPages} pages · ₹{pricing.basePrice}/page
              </div>
            </div>
            <div className="text-3xl font-black text-primary">₹{pricing.total}</div>
          </div>
          <button
            onClick={() => router.push('/review')}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
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
