/**
 * Low-level HTTP helpers shared by the API client. No app imports, so it can
 * be unit tested with `node --test`.
 */

export class APIError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Parse a fetch response. Error pages from proxies or rate limiters are often
 * HTML, so the body is read as text first and only parsed as JSON if it is.
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const fallback =
      response.status >= 500
        ? 'The print service is having trouble right now. Please try again in a moment.'
        : `Request failed (${response.status})`;
    throw new APIError(data?.message || fallback, response.status, data?.code);
  }

  if (data === null) {
    throw new APIError('The server sent an unexpected response.', response.status);
  }

  return data as T;
}
