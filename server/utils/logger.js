'use strict';

/**
 * Minimal structured logger.
 *
 * Writes JSON lines to stdout so logs stay machine-parseable on hosting
 * platforms (Render, etc.). Honours DEBUG=1 to enable debug output.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const currentLevel = process.env.DEBUG ? 'debug' : 'info';

function log(level, message, meta) {
  if (LEVELS[level] < LEVELS[currentLevel]) return;
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && typeof meta === 'object' ? meta : { meta }),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};

module.exports = logger;
