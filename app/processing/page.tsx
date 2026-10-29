'use client';

import { useRouter } from 'next/navigation';
import { homeHref, usePrintJob } from '@/context/PrintJobContext';
import { useEffect, useState } from 'react';
import { getJobStatus } from '@/lib/api/client';
import { jobStatusWS } from '@/lib/websocket';
import {
  isTerminalStatus,
  nextPollDelay,
  POLL_ERRORS_BEFORE_NOTICE,
  POLL_MAX_MS,
  POLL_SLOW_AFTER_MS,
  progressFor,
} from '@/lib/polling';

type Tone = 'primary' | 'success' | 'warning' | 'error';
type Motion = 'idle' | 'print' | 'stop' | 'done';

const STEP_LABELS = ['Paid', 'Queued', 'Preparing', 'Printing', 'Ready'];

/** Index of the step in progress. Steps before it are done; 5 means all of them. */
const STEP_FOR_STATUS: Record<string, number> = { queued: 1, assigned: 2, printing: 3, completed: 5 };

/** Gradient endpoints for the status card, one per tone. */
const CARD_BACKGROUND: Record<Tone, string> = {
  primary: 'linear-gradient(160deg, rgb(var(--color-primary)), rgb(var(--color-primary-light)))',
  success: 'linear-gradient(160deg, #15803d, #22c55e)',
  warning: 'linear-gradient(160deg, #b45309, #f59e0b)',
  error: 'linear-gradient(160deg, #b91c1c, #dc2626)',
};

export default function ProcessingPage() {
  const router = useRouter();
  const { printJob, hydrated, updateStatus } = usePrintJob();
  const [progress, setProgress] = useState(0);
  // null until the first real status arrives. Defaulting to 'queued' showed
  // "Waiting in queue" for a job that had already failed.
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [delayed, setDelayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const paid = printJob.payment.status === 'success';
  const { printJobId } = printJob;

  useEffect(() => {
    if (!hydrated) return;
    if (!paid || !printJobId) {
      router.push(homeHref(printJob.kioskId));
    }
  }, [hydrated, paid, printJobId, printJob.kioskId, router]);

  useEffect(() => {
    if (!hydrated || !paid || !printJobId) return;

    let isActive = true;
    let finished = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let wsUnsubscribe: (() => void) | null = null;
    let failures = 0;
    let lastStatus = 'queued';
    const startedAt = Date.now();

    const stopAll = () => {
      finished = true;
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = null;
      if (wsUnsubscribe) wsUnsubscribe();
      wsUnsubscribe = null;
      jobStatusWS.disconnect();
    };

    const updateJobProgress = (status: string, data?: any) => {
      if (!isActive || finished) return;

      lastStatus = status;
      setJobStatus(status);
      setNotice(null);

      if (status === 'failed' || status === 'cancelled') {
        stopAll();
        setError(
          status === 'failed'
            ? data?.errorMessage || 'Printing failed'
            : 'Print job was cancelled'
        );
        return;
      }

      const known = STEP_FOR_STATUS[status];
      if (known !== undefined) setStep(known);

      setError(null);
      setProgress(progressFor(status, data?.printedPages));

      if (status === 'completed') {
        stopAll();
        updateStatus('complete');
        setTimeout(() => {
          router.push('/complete');
        }, 500);
      }
    };

    const schedulePoll = () => {
      if (!isActive || finished) return;
      // Slow, not failed: keep polling at the slowest rate and say so.
      const slow = Date.now() - startedAt > POLL_SLOW_AFTER_MS;
      if (slow) setDelayed(true);
      pollTimer = setTimeout(
        pollJobStatus,
        slow ? POLL_MAX_MS : nextPollDelay(failures)
      );
    };

    async function pollJobStatus() {
      try {
        const status = await getJobStatus(printJobId!);
        failures = 0;
        updateJobProgress(status.status, status);
      } catch (err: any) {
        if (!isActive) return;
        failures++;
        console.error('Error polling job status:', err);
        if (failures >= POLL_ERRORS_BEFORE_NOTICE) {
          setNotice('Having trouble reaching the printer. Still trying…');
        }
      }
      if (!isTerminalStatus(lastStatus)) schedulePoll();
    }

    const initializeWebSocket = async () => {
      try {
        await jobStatusWS.subscribe(printJobId);
        if (!isActive || finished) {
          jobStatusWS.disconnect();
          return;
        }
        wsUnsubscribe = jobStatusWS.onStatusUpdate((status, data) => updateJobProgress(status, data));
      } catch (err) {
        if (!isActive || finished) return;
        console.warn('WebSocket connection failed; polling continues', err);
      }
    };

    // One poll first: after a reload the job may already be further along (or done).
    getJobStatus(printJobId)
      .then((status) => updateJobProgress(status.status, status))
      .catch((err) => console.warn('Initial status check failed', err))
      .finally(() => {
        // Polling always runs. The live connection only makes updates faster: a
        // failure pushed by the server can be missed, and must not leave the
        // screen stuck on the last status it happened to see.
        if (isActive && !finished) {
          schedulePoll();
          initializeWebSocket();
        }
      });

    return () => {
      isActive = false;
      stopAll();
    };
  }, [hydrated, paid, printJobId, router, updateStatus]);

  // ---- what the card shows ----
  const failed = !!error;
  const completed = jobStatus === 'completed';
  const tone: Tone = failed ? 'error' : completed ? 'success' : delayed ? 'warning' : 'primary';
  const motion: Motion = failed
    ? 'stop'
    : completed
      ? 'done'
      : jobStatus === 'printing'
        ? 'print'
        : 'idle';

  const title = failed
    ? 'Printing did not finish'
    : completed
      ? 'Your prints are ready'
      : delayed
        ? jobStatus === 'queued'
          ? 'Still waiting in queue'
          : 'Still printing'
        : jobStatus === 'queued'
          ? 'Waiting in queue'
          : jobStatus === 'assigned'
            ? 'Preparing your document'
            : jobStatus === 'printing'
              ? 'Printing your document'
              : 'Checking your print…';

  const subtitle = failed
    ? error
    : completed
      ? 'Collect them from the tray at the kiosk.'
      : delayed
        ? 'This is taking longer than usual. Your job is safe, so keep this page open.'
        : jobStatus === 'queued'
          ? 'Your print starts as soon as the printer is free.'
          : jobStatus === 'assigned'
            ? 'The printer is getting your pages ready.'
            : jobStatus === 'printing'
              ? 'Keep this page open to follow along.'
              : 'One moment please.';

  const note = failed
    ? { tone: 'error' as const, text: 'An error occurred during printing. Please show this screen to the shop staff.' }
    : delayed
      ? { tone: 'warning' as const, text: 'Nothing is wrong with your job. Shop staff can see it if you need help.' }
      : completed
        ? null
        : { tone: 'info' as const, text: 'You can keep this page open. If it reloads, your job is still safe.' };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* my-auto instead of centring the whole column: a tall column on a phone
          is no longer pushed off the top of the screen. */}
      <div className="my-auto w-full max-w-md">
        <div
          className="animate-on-scroll-scale relative overflow-hidden rounded-2xl p-5 text-center text-white shadow-lg"
          style={{ background: CARD_BACKGROUND[tone] }}
        >
          <StatusPrinter tone={tone} motion={motion} />

          <h1 className="text-xl font-bold leading-tight">{title}</h1>
          <p className="mt-1 text-sm text-white/85">{subtitle}</p>

          {!failed && (
            <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold tabular-nums">
              {progress}%
            </span>
          )}

          {/* A failure with no earlier status seen still happened while printing. */}
          <StepTracker step={failed ? Math.max(step, 3) : step} failed={failed} delayed={delayed} />
        </div>

        {note && (
          <div
            role={note.tone === 'error' ? 'alert' : undefined}
            className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm text-text ${
              note.tone === 'error'
                ? 'border-error/20 bg-error/10'
                : note.tone === 'warning'
                  ? 'border-warning/30 bg-warning/10'
                  : 'border-primary/15 bg-primary/5'
            }`}
          >
            <span className="flex-shrink-0">{note.tone === 'error' ? '⚠️' : note.tone === 'warning' ? '⏳' : '💡'}</span>
            <p>{notice ?? note.text}</p>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-surface-secondary p-4">
          <DetailRow label="Document" value={printJob.document.name} />
          <DetailRow label="Pages" value={String(printJob.jobPricing?.totalPages ?? printJob.pricing.totalPages)} />
          <DetailRow label="Kiosk" value={printJob.kioskId} />
          <DetailRow label="Transaction ID" value={printJob.payment.transactionId ?? '—'} />
        </div>
      </div>
    </div>
  );
}

/** The printer in the card. Its paper and badge move according to the motion. */
function StatusPrinter({ tone, motion }: { tone: Tone; motion: Motion }) {
  const badge =
    tone === 'success' ? (
      <g className="pp-badge text-success">
        <circle cx="128" cy="30" r="15" fill="#fff" />
        <path className="pp-tick" d="M121 30l5 5 9-10" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ) : tone === 'error' ? (
      <g className="pp-badge text-error">
        <circle cx="128" cy="30" r="15" fill="#fff" />
        <path d="M128 23v9M128 36v.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      </g>
    ) : tone === 'warning' ? (
      <g className="pp-badge text-warning">
        <circle cx="128" cy="30" r="15" fill="#fff" />
        <path d="M128 23v8M128 35v.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      </g>
    ) : null;

  return (
    <div className={`relative mx-auto mb-3 flex h-20 w-24 items-center justify-center pp-${motion}`}>
      {(tone === 'primary' || tone === 'warning') && <span className="pp-ring" aria-hidden="true" />}
      <svg viewBox="0 0 160 140" className="h-full w-full" aria-hidden="true">
        <ellipse cx="80" cy="130" rx="58" ry="6" fill="rgba(0,0,0,0.18)" />
        <rect className="pp-paper" x="50" y="10" width="60" height="58" rx="4" fill="#fff" />
        <line x1="60" y1="26" x2="100" y2="26" stroke="rgba(0,0,0,0.15)" strokeWidth={3} strokeLinecap="round" />
        <line x1="60" y1="38" x2="92" y2="38" stroke="rgba(0,0,0,0.15)" strokeWidth={3} strokeLinecap="round" />
        <line x1="60" y1="50" x2="96" y2="50" stroke="rgba(0,0,0,0.15)" strokeWidth={3} strokeLinecap="round" />
        <rect x="14" y="62" width="132" height="50" rx="12" fill="rgba(255,255,255,0.92)" />
        <circle cx="126" cy="84" r="5" fill="rgb(var(--color-success))" />
        <rect x="36" y="100" width="88" height="22" rx="5" fill="rgba(255,255,255,0.6)" />
        {badge}
      </svg>
    </div>
  );
}

/** Paid → Queued → Preparing → Printing → Ready. */
function StepTracker({ step, failed, delayed }: { step: number; failed: boolean; delayed: boolean }) {
  // Nodes sit between 10% and 90% of the width, so the fill covers 80% at most.
  const fillFraction = Math.min(step, STEP_LABELS.length - 1) / (STEP_LABELS.length - 1);

  return (
    <ol className="relative mt-6 flex w-full justify-between" aria-label="Print progress">
      <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[11px] h-0.5 bg-white/30" />
      <div
        aria-hidden="true"
        className="absolute left-[10%] top-[11px] h-0.5 bg-white transition-all duration-700 ease-out"
        style={{ width: `${fillFraction * 80}%` }}
      />
      {STEP_LABELS.map((label, i) => {
        const done = i === 0 || i < step;
        const current = !done && i === step;
        const flagged = current && (failed || delayed);
        return (
          <li key={label} className="relative flex w-12 flex-col items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                done
                  ? 'border-white bg-white text-primary'
                  : flagged
                    ? 'border-white bg-white/0 text-white'
                    : current
                      ? 'border-white bg-white/0 text-white animate-pulse'
                      : 'border-white/40 bg-white/10 text-white/70'
              }`}
            >
              {done ? '✓' : flagged ? (failed ? '×' : '!') : i + 1}
            </span>
            <span className={`text-[11px] ${current || done ? 'font-semibold text-white' : 'text-white/70'}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <span className="text-text-muted">{label}</span>
      <span className="max-w-[60%] truncate text-right font-semibold text-text">{value}</span>
    </div>
  );
}
