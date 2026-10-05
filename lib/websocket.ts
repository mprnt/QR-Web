/**
 * WebSocket client for real-time job status updates
 * Falls back to polling if WebSocket is unavailable
 */

type MessageHandler = (data: any) => void;

const DEFAULT_API_URL = 'http://localhost:3000/api/v1';
const WS_PATH = '/ws';

/**
 * Build the WebSocket URL. NEXT_PUBLIC_WS_URL wins when set. Otherwise it is
 * derived from the API base URL (which already includes `/api/v1`): same host,
 * same path prefix, ws/wss chosen from the API's own protocol, not the page's.
 */
export function getWsUrl(
  apiBaseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  override: string | undefined = process.env.NEXT_PUBLIC_WS_URL
): string {
  if (override) return override;
  const url = new URL(apiBaseUrl || DEFAULT_API_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = url.pathname.replace(/\/+$/, '') + WS_PATH;
  url.search = '';
  url.hash = '';
  return url.toString();
}
type StatusUpdateHandler = (status: string, data?: any) => void;

export class JobStatusWebSocket {
  private ws: WebSocket | null = null;
  private jobId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusUpdateHandler> = new Set();
  private isConnecting = false;
  /** Set by disconnect(); stops onclose from reconnecting a socket we closed on purpose. */
  private manuallyClosed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connect and subscribe to a job's status updates
   */
  subscribe(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
        reject(new Error('WebSocket is only available in the browser'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN && this.jobId === jobId) {
        resolve();
        return;
      }

      this.jobId = jobId;
      this.isConnecting = true;
      this.manuallyClosed = false;
      let settled = false;

      try {
        const ws = new WebSocket(getWsUrl());
        this.ws = ws;

        ws.onopen = () => {
          settled = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected');

          // Subscribe to job
          ws.send(JSON.stringify({
            type: 'subscribe',
            jobId,
          }));

          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'subscribed') {
              console.log('[WebSocket] Subscribed to job', jobId);
            } else if (data.type === 'job-status') {
              console.log('[WebSocket] Status update:', data.status);
              // Notify all handlers
              this.statusHandlers.forEach(handler => {
                handler(data.status, data.data);
              });
            }

            // Notify message handlers
            this.messageHandlers.forEach(handler => {
              handler(data);
            });
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('[WebSocket] Error:', error);
          // After a successful open the promise has already resolved; onclose
          // follows and handles reconnecting.
          if (!settled) {
            settled = true;
            reject(error);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          if (this.ws === ws) this.ws = null;
          if (!this.manuallyClosed && this.jobId) this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Unsubscribe from job status updates
   */
  unsubscribe(jobId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        jobId,
      }));
    }
    this.jobId = null;
  }

  /**
   * Listen for job status updates
   */
  onStatusUpdate(handler: StatusUpdateHandler): () => void {
    this.statusHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * Listen for all WebSocket messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocket] Max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.jobId && !this.manuallyClosed) {
        this.subscribe(this.jobId).catch((error) => {
          console.error('[WebSocket] Reconnect failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.manuallyClosed = true;
    this.jobId = null;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      const ws = this.ws;
      this.ws = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
    }
    this.messageHandlers.clear();
    this.statusHandlers.clear();
  }
}

// Singleton instance
export const jobStatusWS = new JobStatusWebSocket();
