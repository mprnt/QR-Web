import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWsUrl, JobStatusWebSocket } from '../lib/websocket.ts';

test('WS URL keeps the API path prefix once, no double /api/v1 (bug 5)', () => {
  assert.equal(getWsUrl('https://api.example.com/api/v1', undefined), 'wss://api.example.com/api/v1/ws');
  assert.equal(getWsUrl('http://localhost:4000/api/v1/', undefined), 'ws://localhost:4000/api/v1/ws');
});

test('WS protocol follows the API URL, not the page', () => {
  assert.equal(getWsUrl('http://10.0.0.5:3000/api/v1', undefined), 'ws://10.0.0.5:3000/api/v1/ws');
});

test('NEXT_PUBLIC_WS_URL override wins', () => {
  assert.equal(getWsUrl('https://api.example.com/api/v1', 'wss://ws.example.com/socket'), 'wss://ws.example.com/socket');
});

test('default without env is the local backend', () => {
  assert.equal(getWsUrl('', undefined), 'ws://localhost:3000/api/v1/ws');
});

class FakeSocket {
  static OPEN = 1;
  static instances: FakeSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  url: string;
  constructor(url: string) {
    this.url = url;
    FakeSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.closed = true;
    this.readyState = 3;
    this.onclose?.();
  }
}

test('disconnect does not reconnect afterwards (bug 6)', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const g = globalThis as any;
  const saved = { window: g.window, WebSocket: g.WebSocket };
  g.window = {};
  g.WebSocket = FakeSocket;
  try {
    const ws = new JobStatusWebSocket();
    const p = ws.subscribe('job-1');
    const sock = FakeSocket.instances.at(-1)!;
    sock.readyState = 1;
    sock.onopen?.();
    await p;
    const before = FakeSocket.instances.length;
    ws.disconnect();
    assert.equal(sock.closed, true);
    t.mock.timers.tick(120_000);
    assert.equal(FakeSocket.instances.length, before, 'no new socket after disconnect');
  } finally {
    g.window = saved.window;
    g.WebSocket = saved.WebSocket;
  }
});

test('an unexpected drop does reconnect', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const g = globalThis as any;
  const saved = { window: g.window, WebSocket: g.WebSocket };
  g.window = {};
  g.WebSocket = FakeSocket;
  try {
    const ws = new JobStatusWebSocket();
    const p = ws.subscribe('job-1');
    const sock = FakeSocket.instances.at(-1)!;
    sock.readyState = 1;
    sock.onopen?.();
    await p;
    const before = FakeSocket.instances.length;
    sock.onclose?.();
    t.mock.timers.tick(2000);
    assert.equal(FakeSocket.instances.length, before + 1);
    ws.disconnect();
  } finally {
    g.window = saved.window;
    g.WebSocket = saved.WebSocket;
  }
});
