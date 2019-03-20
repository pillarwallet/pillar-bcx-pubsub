const convict = require('convict');

let env = '';

const config = convict({
  env: {
    format: ['development', 'test', 'qa', 'production'],
    default: 'development',
    arg: 'env',
    env: 'NODE_ENV',
  },
  protocol: {
    format: String,
    default: 'Ethereum',
    arg: 'protocol',
    env: 'BCX_PROTOCOL',
  },
  maxWallets: {
    format: String,
    default: 'Ethereum',
    arg: 'maxWallets',
    env: 'BCX_MAX_WALLETS',
  },
  checksumkey: {
    format: '*',
    default: 'checksumKey',
    arg: 'checksumKey',
    env: 'BCX_CHECKSUM_KEY',
  },
  accounts: {
    numberToFetch: {
      format: Number,
      default: 100,
      arg: 'bcxAccountsToFetch',
      env: 'BCX_ACCOUNTS_NUMBER_TO_FETCH',
    },
  },
  geth: {
    url: {
      format: '*',
      default: null,
      arg: 'gethNodeUrl',
      env: 'BCX_GETH_NODE_URL',
    },
    port: {
      format: '*',
      default: null,
      arg: 'gethNodePort',
      env: 'BCX_GETH_NODE_PORT',
    },
  },
  parity: {
    url: {
      format: '*',
      default: null,
      arg: 'parityNodeUrl',
      env: 'BCX_PARITY_NODE_URL',
    },
    port: {
      format: '*',
      default: null,
      arg: 'parityNodePort',
      env: 'BCX_PARITY_NODE_PORT',
    },
  },
  mq: {
    topic: {
      notifications: {
        format: String,
        default: 'mq',
        arg: 'mqNotificationsQueue',
        env: 'BCX_NOTIFICATIONS_QUEUE',
      },
    },
    server: {
      format: String,
      default: 'mq',
      arg: 'mqServer',
      env: 'BCX_RABBITMQ_SERVER',
    },
    username: {
      format: String,
      default: 'guest',
      arg: 'mqUsername',
      env: 'BCX_RABBITMQ_USERNAME',
    },
    password: {
      format: String,
      default: 'guest',
      arg: 'mqPassword',
      env: 'BCX_RABBITMQ_PASSWORD',
      sensitive: true,
    },
  },
  redis: {
    port: {
      format: Number,
      default: 6379,
      arg: 'bcxRedisPort',
      env: 'BCX_REDIS_PORT',
    },
    host: {
      format: String,
      default: 'redis',
      arg: 'bcxRedisHost',
      env: 'BCX_REDIS_HOST',
    },
    password: {
      format: String,
      default: 'redis',
      arg: 'bcxRedisPassword',
      env: 'BCX_REDIS_PASSWORD',
      sensitive: true,
    },
  },
  db: {
    username: {
      format: String,
      default: '',
      arg: 'dbUsername',
      env: 'BCX_MONGO_USER',
    },
    password: {
      format: String,
      default: '',
      arg: 'dbPassword',
      env: 'BCX_MONGO_PASSWORD',
      sensitive: true,
    },
    database: {
      format: String,
      default: 'pillar',
      arg: 'dbDatabase',
      env: 'BCX_MONGO_DATABASE_NAME',
    },
    host: {
      format: String,
      default: 'db',
      arg: 'dbServer',
      env: 'BCX_MONGO_SERVER_ADDRESS',
    },
  },
  housekeeper: {
    totalTransactions: {
      format: Number,
      default: 100,
      arg: 'totalTransactions',
      env: 'BCX_MAX_TOTAL_TRANSACTIONS_RECOVERALL_PROCESS_SYNC',
    },
    accountConcurrency: {
      format: Number,
      default: 2,
      arg: 'accountConcurrency',
      env: 'BCX_ACCOUNTS_CONCURRENCY_PROCESS_DATA',
    },
    accountWaitInterval: {
      format: Number,
      default: 500,
      arg: 'accountWaitInterval',
      env: 'BCX_ACCOUNTS_WAIT_INTERVAL_PROCESS_DATA',
    },
    getTransWaitInterval: {
      format: Number,
      default: 500,
      arg: 'accountTransWaitInterval',
      env: 'BCX_ACCOUNTS_WAIT_INTERVAL_GET_TRANSACTIONS',
    },
    processBlockInterval: {
      format: Number,
      default: 5000,
      arg: 'processBlockInterval',
      env: 'BCX_PROCESS_BLOCKS_INTERVAL_PROCESS_DATA',
    },
  },
});

env = config.get('env');
config.loadFile(`${__dirname}/${env}.json`);

// throws error if config does not conform to schema
config.validate({ allowed: 'strict' });

module.exports = config;
