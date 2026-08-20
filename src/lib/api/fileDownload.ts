import { parseContentDispositionFilename, triggerFileDownload } from '@/src/utils/download';
import { handleSessionExpiry } from './sessionExpiry';

/**
 * Browser-safe: fetches a file from one of the Next.js Route Handlers and
 * hands it to the browser to save. The session cookie rides along
 * automatically, so no auth header is needed.
 *
 * A failure comes back from the handler as the usual JSON error shape, and is
 * rethrown here in the same `Error & { details }` form the module clients
 * throw, so callers can keep using `getApiErrorInfo` on it.
 *
 * @param url - Same-origin Route Handler path.
 * @param fallbackFilename - Used when the response does not name the file.
 * @param init - Extra fetch options, e.g. a POST body carrying export criteria.
 */
export async function downloadFile(url: string, fallbackFilename: string, init?: RequestInit): Promise<void> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw await buildDownloadError(response);
  }

  const blob = await response.blob();
  const filename = parseContentDispositionFilename(response.headers.get('content-disposition')) ?? fallbackFilename;

  triggerFileDownload(blob, filename);
}

/**
 * The error body is normally JSON, but a failure early in the stack (a proxy,
 * a crash before the handler runs) can answer with something else — so a
 * body that will not parse falls back to the status text rather than
 * throwing a `SyntaxError` over the real failure.
 */
async function buildDownloadError(response: Response): Promise<Error & { details?: unknown }> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  handleSessionExpiry(response, payload);

  const message = (payload as { message?: string } | undefined)?.message ?? response.statusText ?? 'Request failed';

  const error = new Error(message) as Error & { details?: unknown };

  error.details = payload;

  return error;
}
