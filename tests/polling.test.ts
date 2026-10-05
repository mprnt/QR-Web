import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTerminalStatus, nextPollDelay, POLL_BASE_MS, POLL_MAX_MS, progressFor } from '../lib/polling.ts';

test('polling stops on every terminal status (bug 7)', () => {
  for (const s of ['completed', 'failed', 'cancelled']) assert.equal(isTerminalStatus(s), true, s);
  for (const s of ['queued', 'assigned', 'printing']) assert.equal(isTerminalStatus(s), false, s);
});

test('poll delay backs off on failures and is capped', () => {
  assert.equal(nextPollDelay(0), POLL_BASE_MS);
  assert.ok(nextPollDelay(1) > POLL_BASE_MS);
  assert.ok(nextPollDelay(2) > nextPollDelay(1));
  assert.equal(nextPollDelay(50), POLL_MAX_MS);
});

test('progress mapping', () => {
  assert.equal(progressFor('queued'), 10);
  assert.equal(progressFor('printing', 100), 95);
  assert.equal(progressFor('completed'), 100);
});
