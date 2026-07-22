/* eslint-disable no-console */
import { isDevelopment } from '@/src/config/env';
import type { Logger } from './logger.types';

export const browserLogger: Logger = {
  trace(message, meta) {
    if (isDevelopment) {
      console.debug(message, meta);
    }
  },

  debug(message, meta) {
    if (isDevelopment) {
      console.debug(message, meta);
    }
  },

  info(message, meta) {
    if (isDevelopment) {
      console.info(message, meta);
    }
  },

  warn(message, meta) {
    console.warn(message, meta);
  },

  error(message, error, meta) {
    console.error(message, error, meta);

    // Future:
    // Sentry.captureException(error);
  },

  fatal(message, error, meta) {
    console.error(message, error, meta);
  },
};
