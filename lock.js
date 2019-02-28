const Redlock = require('redlock');

const migrate = require('migrate');

const redis = require('redis');

const client = redis.createClient();
const logger = require('./src/utils/logger');

const resource = 'executing-migration';
const ttl = 600000;

const redlock = new Redlock([client], {
  retryCount: 0,
});

redlock.lock(resource, ttl, (err, lock) => {
  if (err) {
    logger.info(
      'Lock not adquired, migrations already running or redis down?',
      err,
    );
    process.exit();
  } else {
    try {
      migrate.load(
        {
          stateStore: '.migrate',
        },
        (err, set) => {
          if (err) {
            throw err;
          }
          set.up(err => {
            if (err) {
              throw err;
            }
            logger.info('migrations successfully ran');
            lock.unlock(err => {
              if (err) {
                logger.error('Failed to unlock', err);
                throw err;
              }
              process.exit();
            });
          });
        },
      );
    } catch (err) {
      logger.error('Failed running migration', err);
      lock.unlock(err => {
        if (err) {
          logger.error('Failed to unlock', err);
          throw err;
        }
        process.exit();
      });
    }
  }
});
