'use client';

import { useState, useEffect } from 'react';
import { usePrintJob } from '@/context/PrintJobContext';
import { msUntil } from '@/lib/jobState';

/**
 * Counts down to the backend session's `expiresAt`. When it runs out the
 * customer is sent to the timeout screen, except while a payment is under way
 * or done: leaving then could strand money already taken. Pages that handle
 * payment pass `holdRedirect` to show the expiry without navigating.
 */
export function SessionTimer({ holdRedirect = false }: { holdRedirect?: boolean }) {
  const { printJob } = usePrintJob();
  const { expiresAt } = printJob;
  const paymentUnderway = printJob.payment.status === 'processing' || printJob.payment.status === 'success';
  const mayRedirect = !holdRedirect && !paymentUnderway;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const remaining = msUntil(expiresAt, Date.now());
      setTimeLeft(remaining);

      if (remaining === 0 && mayRedirect) {
        window.location.href = '/error?reason=timeout';
      }
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, mayRedirect]);

  if (timeLeft === null) {
    return <div className="text-sm font-medium text-text-muted">Time left: --:--</div>;
  }

  if (timeLeft === 0) {
    return <div className="text-sm font-medium text-error">Session expired</div>;
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isWarning = timeLeft < 2 * 60 * 1000;

  return (
    <div
      className={`text-sm font-medium ${
        isWarning ? 'text-error' : 'text-text-muted'
      }`}
    >
      Time left: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
