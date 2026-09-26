/**
 * WebSocket client for real-time job status updates
 * Falls back to polling if WebSocket is unavailable
 */

type MessageHandler = (data: any) => void;
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

  private getUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
    return `${protocol}//${host}/api/v1/ws`;
  }

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

      try {
        this.ws = new WebSocket(this.getUrl());

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected');

          // Subscribe to job
          this.ws!.send(JSON.stringify({
            type: 'subscribe',
            jobId,
          }));

          resolve();
        };

        this.ws.onmessage = (event) => {
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

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.attemptReconnect();
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

    setTimeout(() => {
      if (this.jobId) {
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.statusHandlers.clear();
  }
}

// Singleton instance
export const jobStatusWS = new JobStatusWebSocket();
