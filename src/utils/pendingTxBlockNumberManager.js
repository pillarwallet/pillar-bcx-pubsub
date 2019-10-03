const HashMap = require('hashmap');
const logger = require('./logger');
const redisService = require('../services/redisService');
let client;
let pendingTxBlockNumber = new HashMap();
let PENDING_TX_BLOCK_NUMBER = 'pendingTxBlockNumber';

function connect() {
  try {
    client = redisService.connectRedis();
    logger.info('ethService successfully connected to Redis server');
    client.on('error', err => {
      logger.error(`ethService failed with REDIS client error: ${err}`);
    });
    loadHash();
  } catch (e) {
    logger.error(e);
  }
}

module.exports.connect = connect;

function set(key, value) {
  module.exports.pendingTxBlockNumber.set(key, value);
  client.hset(PENDING_TX_BLOCK_NUMBER, key, JSON.stringify(value));
}

module.exports.set = set;

function count() {
  return module.exports.pendingTxBlockNumber.count();
}

module.exports.count = count;

function get(key) {
  return module.exports.pendingTxBlockNumber.get(key);
}

module.exports.get = get;

function deleteFn(key) {
  client.hdel(PENDING_TX_BLOCK_NUMBER, key);
  return module.exports.pendingTxBlockNumber.delete(key);
}

module.exports.delete = deleteFn;

function has(key) {
  return module.exports.pendingTxBlockNumber.has(key);
}

module.exports.has = has;

function keys() {
  return module.exports.pendingTxBlockNumber.keys();
}

module.exports.keys = keys;

function values() {
  return module.exports.pendingTxBlockNumber.values();
}

module.exports.values = values;

function loadHash() {
  client.hgetall(PENDING_TX_BLOCK_NUMBER, function(err, obj) {
    if (obj) {
      module.exports.pendingTxBlockNumber = new HashMap(obj);
    }
  });
}

module.exports.loadHash = loadHash;

module.exports.pendingTxBlockNumber = pendingTxBlockNumber;

connect();
