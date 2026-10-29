/**
 * Job status polling rules for the processing page. Pure, so it can be unit
 * tested with `node --test`.
 */

export type JobStatus = 'queued' | 'assigned' | 'printing' | 'completed' | 'failed' | 'cancelled';

export const TERMINAL_STATUSES: ReadonlySet<string> = new Set(['completed', 'failed', 'cancelled']);

export const POLL_BASE_MS = 2000;
export const POLL_MAX_MS = 30000;
/**
 * After this long without a terminal status the customer is told the print is
 * slow (amber, not an error), and polling slows to POLL_MAX_MS. It never gives
 * up: a job still printing after 10 minutes is not a failed job.
 */
export const POLL_SLOW_AFTER_MS = 10 * 60 * 1000;
/** Consecutive failed polls before the customer is told something is wrong. */
export const POLL_ERRORS_BEFORE_NOTICE = 3;

export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

/** Delay before the next poll: steady while healthy, exponential backoff after failures. */
export function nextPollDelay(consecutiveFailures: number): number {
  if (consecutiveFailures <= 0) return POLL_BASE_MS;
  return Math.min(POLL_MAX_MS, POLL_BASE_MS * 2 ** consecutiveFailures);
}

export function progressFor(status: string, printedPages?: number): number {
  switch (status) {
    case 'queued':
      return 10;
    case 'assigned':
      return 30;
    case 'printing':
      return 60 + (printedPages ? Math.min(printedPages * 5, 35) : 0);
    case 'completed':
      return 100;
    default:
      return 0;
  }
}
