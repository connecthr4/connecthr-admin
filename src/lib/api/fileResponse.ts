import 'server-only';

import { STRINGS } from '@/src/constants/strings';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * The backend still names its exports after the old brand. Matches the
 * name whether it arrives plain, spaced, hyphenated or with the space
 * percent-encoded in an RFC 5987 `filename*` value.
 */
const LEGACY_BRAND_PATTERN = /connect(?:%20|[\s_-])?hr/gi;

/**
 * Swaps the legacy brand in a `Content-Disposition` header for the current
 * one, leaving the rest of the file name (dates, module, extension) intact.
 */
export function rebrandContentDisposition(header: string): string {
  return header.replace(LEGACY_BRAND_PATTERN, STRINGS.APP_NAME);
}

/**
 * Relays a backend file response to the browser. The body is piped through
 * untouched — never buffered into memory here — so the file stays
 * byte-identical however large it grows. Only the file name is touched, to
 * carry the current brand.
 *
 * @param upstream - The unread backend response, from an `ApiClient` raw call.
 * @param fallbackFilename - Used when the backend does not name the file itself.
 */
export function streamFileResponse(upstream: Response, fallbackFilename: string): Response {
  const upstreamDisposition = upstream.headers.get('content-disposition');

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? XLSX_CONTENT_TYPE,
      'Content-Disposition': upstreamDisposition
        ? rebrandContentDisposition(upstreamDisposition)
        : `attachment; filename="${fallbackFilename}"`,
      /**
       * Exports reflect live data, and they ride on the session cookie —
       * neither the browser nor any shared cache should keep a copy.
       */
      'Cache-Control': 'no-store',
    },
  });
}
