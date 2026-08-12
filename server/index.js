'use strict';

/**
 * Server entry point. Loads configuration, mounts the Express app from
 * app.js and starts listening. All application logic lives in app.js and the
 * modular folders (controllers/, routes/, services/, models/, middleware/,
 * utils/, config/, database/).
 */

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
});

const { config } = require('./config/env');
const logger = require('./utils/logger');
const app = require('./app');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`kora-server running on port ${PORT} (${config.env})`, {
    paymentMode: config.paymentMode,
    smsConfigured: Boolean(config.africastalking.username && config.africastalking.apiKey),
    atSandbox: config.africastalking.sandbox,
  });
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
