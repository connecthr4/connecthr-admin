import 'server-only';

/**
 * Extracts the `name=value` pair from each raw Set-Cookie header (dropping
 * attributes like Path/HttpOnly/Expires, which only matter for a browser)
 * and joins them into a value usable as an outgoing `Cookie` header.
 *
 * This lets the server replay whatever cookie(s) the backend issued on
 * login without the frontend needing to know their name(s) in advance.
 */
export function buildCookieCarrier(setCookieHeaders: string[]): string {
  return setCookieHeaders
    .map((raw) => raw.split(';')[0]?.trim())
    .filter((pair): pair is string => Boolean(pair))
    .join('; ');
}
