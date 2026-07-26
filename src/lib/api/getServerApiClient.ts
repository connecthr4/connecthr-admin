import 'server-only';
import { ApiClient } from './client';
import { ServerAuthAdapter } from './serverAuthAdapter';

/**
 * Not a module-level singleton — `cookies()` is request-scoped, so a shared
 * instance would leak refresh state across concurrent requests on the server.
 */
export function getServerApiClient(): ApiClient {
  return new ApiClient(new ServerAuthAdapter());
}
