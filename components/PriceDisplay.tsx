'use client';

import { usePrintJob } from '@/context/PrintJobContext';

export function PriceDisplay() {
  const { printJob } = usePrintJob();
  const { pricing } = printJob;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-text-muted">Total Cost</div>
            <div className="text-3xl font-bold text-text">₹{pricing.total}</div>
          </div>
          <div className="text-right text-sm text-text-muted">
            <div>{pricing.totalPages} pages</div>
            <div>₹{pricing.basePrice}/page</div>
          </div>
        </div>
      </div>
    </div>
  );
}
