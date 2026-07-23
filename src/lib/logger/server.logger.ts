import pino from 'pino';
import { REDACT_FIELDS } from './redact';
import { isDevelopment } from '@/src/config/env';

export const serverLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',

  timestamp: pino.stdTimeFunctions.isoTime,

  base: {
    app: 'connecthr-admin',
  },

  redact: REDACT_FIELDS,

  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'hostname,pid',
        },
      }
    : undefined,
});
