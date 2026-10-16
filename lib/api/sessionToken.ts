/**
 * Which session token a request should send. Pure and dependency-free, so it
 * can be unit tested with `node --test`.
 */

/** The token stored inside the saved job JSON, or null when there is none. */
export function tokenFromSavedJob(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const token = (JSON.parse(raw) as { sessionToken?: unknown }).sessionToken;
    return typeof token === 'string' && token ? token : null;
  } catch {
    return null;
  }
}

/**
 * `inMemory` is undefined until the app sets a token (or null after a reset).
 * Until then the saved job is the source, so a request made before the page has
 * restored its state still carries the token. After a reset, nothing is sent,
 * even if storage still holds one.
 */
export function resolveSessionToken(
  inMemory: string | null | undefined,
  rawSavedJob: string | null,
): string | null {
  return inMemory !== undefined ? inMemory : tokenFromSavedJob(rawSavedJob);
}
