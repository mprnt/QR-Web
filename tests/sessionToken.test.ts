import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSessionToken, tokenFromSavedJob } from '../lib/api/sessionToken.ts';

const saved = (token: unknown) => JSON.stringify({ backendSessionId: 'S1', sessionToken: token });

test('reads the token from the saved job', () => {
  assert.equal(tokenFromSavedJob(saved('tok-saved')), 'tok-saved');
});

test('no saved job, empty token, or corrupt JSON gives no token', () => {
  assert.equal(tokenFromSavedJob(null), null);
  assert.equal(tokenFromSavedJob(saved('')), null);
  assert.equal(tokenFromSavedJob(saved(42)), null);
  assert.equal(tokenFromSavedJob('not json'), null);
});

test('before any token is set, the saved job supplies it', () => {
  assert.equal(resolveSessionToken(undefined, saved('tok-saved')), 'tok-saved');
});

test('after a reset (null), nothing is sent even if storage still has a token', () => {
  assert.equal(resolveSessionToken(null, saved('tok-saved')), null);
});

test('a token set in memory wins over storage', () => {
  assert.equal(resolveSessionToken('tok-new', saved('tok-saved')), 'tok-new');
});
