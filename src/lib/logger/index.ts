import type { Logger } from './logger.types';
import { browserLogger } from './browser.logger';
import { serverLogger } from './server.logger';

export const logger: Logger =
  typeof window === 'undefined'
    ? {
        trace: (m, meta) => serverLogger.trace(meta ?? {}, m),

        debug: (m, meta) => serverLogger.debug(meta ?? {}, m),

        info: (m, meta) => serverLogger.info(meta ?? {}, m),

        warn: (m, meta) => serverLogger.warn(meta ?? {}, m),

        error: (m, err, meta) =>
          serverLogger.error(
            {
              err,
              ...meta,
            },
            m
          ),

        fatal: (m, err, meta) =>
          serverLogger.fatal(
            {
              err,
              ...meta,
            },
            m
          ),
      }
    : browserLogger;
