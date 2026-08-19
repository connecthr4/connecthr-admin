/**
 * Browser-side helpers for saving a file the API handed back as a blob.
 */

/**
 * Pulls the file name out of a `Content-Disposition` header, preferring the
 * RFC 5987 `filename*` form when the backend sends both. Returns `null` when
 * the header is absent or names nothing usable, leaving the caller to fall
 * back to its own default.
 */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const encoded = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)?.[1];

  if (encoded) {
    try {
      return decodeURIComponent(encoded.trim().replace(/^"|"$/g, ''));
    } catch {
      // Malformed percent-encoding — fall through to the plain `filename`.
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header)?.[1];

  return plain?.trim() || null;
}

/**
 * Saves a blob to disk under `filename`. The object URL is revoked straight
 * after the click, since the browser holds the blob in memory until it is.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
