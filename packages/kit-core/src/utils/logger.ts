/**
 * ============================================================================
 * Logger Utility
 * ============================================================================
 */

import type { LogLevel, LoggerOptions } from '@aevatar/kit-types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export function createLogger(options?: LoggerOptions): Logger {
  const level = options?.level ?? 'info';
  const customLogger = options?.logger;
  
  const currentLevel = LOG_LEVELS[level];

  function shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVELS[targetLevel] >= currentLevel;
  }

  function log(targetLevel: LogLevel, message: string, data?: unknown): void {
    if (!shouldLog(targetLevel)) return;

    if (customLogger) {
      customLogger(targetLevel, message, data);
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [AevatarKit] [${targetLevel.toUpperCase()}]`;
    
    const logFn = targetLevel === 'error' 
      ? console.error 
      : targetLevel === 'warn' 
        ? console.warn 
        : console.log;

    if (data !== undefined) {
      logFn(prefix, message, data);
    } else {
      logFn(prefix, message);
    }
  }

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  };
}

