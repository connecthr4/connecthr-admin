import 'server-only';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Relays a backend file response to the browser. The body is piped through
 * untouched — never buffered into memory here — so the file stays
 * byte-identical however large it grows.
 *
 * @param upstream - The unread backend response, from an `ApiClient` raw call.
 * @param fallbackFilename - Used when the backend does not name the file itself.
 */
export function streamFileResponse(upstream: Response, fallbackFilename: string): Response {
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? XLSX_CONTENT_TYPE,
      'Content-Disposition':
        upstream.headers.get('content-disposition') ?? `attachment; filename="${fallbackFilename}"`,
      /**
       * Exports reflect live data, and they ride on the session cookie —
       * neither the browser nor any shared cache should keep a copy.
       */
      'Cache-Control': 'no-store',
    },
  });
}
