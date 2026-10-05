import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APIError, handleResponse } from '../lib/api/http.ts';

test('HTML error page becomes a readable APIError, not a JSON parse error', async () => {
  const res = new Response('<html>502 Bad Gateway</html>', { status: 502 });
  await assert.rejects(handleResponse(res), (err: unknown) => {
    assert.ok(err instanceof APIError);
    assert.equal(err.statusCode, 502);
    assert.match(err.message, /try again/);
    return true;
  });
});

test('JSON error keeps backend message and code', async () => {
  const body = JSON.stringify({ status: 'error', code: 'JOB_SETTINGS_LOCKED', message: 'locked' });
  await assert.rejects(handleResponse(new Response(body, { status: 409 })), (err: unknown) => {
    assert.ok(err instanceof APIError);
    assert.equal(err.code, 'JOB_SETTINGS_LOCKED');
    assert.equal(err.message, 'locked');
    return true;
  });
});

test('empty 4xx body still gives a message', async () => {
  await assert.rejects(handleResponse(new Response('', { status: 404 })), /Request failed \(404\)/);
});

test('OK JSON is returned; OK non-JSON is rejected', async () => {
  assert.deepEqual(await handleResponse(new Response('{"a":1}', { status: 200 })), { a: 1 });
  await assert.rejects(handleResponse(new Response('<html/>', { status: 200 })), APIError);
});
