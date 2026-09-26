'use client';

import { useState, useEffect } from 'react';

export function SessionTimer({ startTime = 0, duration = 10 * 60 * 1000 }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!startTime) return;

    const updateTimeLeft = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        window.location.href = '/error?reason=timeout';
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  if (timeLeft === null) {
    return <div className="text-sm font-medium text-text-muted">Time left: --:--</div>;
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
