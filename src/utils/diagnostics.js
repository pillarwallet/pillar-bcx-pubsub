const diagnostics = require('@pillarwallet/common-diagnostics');
const logger = require('./logger');

const whitelistedEnvironments = ['staging', 'develop', 'production'];

const sentryConfiguration = {
  dsn: 'https://1qaz2wsx3edc4rfv@sentry.io/1234567',
  debug: true,
};

try {
    diagnostics.sentryBuilder.setWhitelistedEnvironments(whitelistedEnvironments)
        .setConfiguration(sentryConfiguration)
        .start();
    logger.info("Sentry successfully started")
} catch (e) {
logger.error({ err: e }, 'Sentry failed to start');
}