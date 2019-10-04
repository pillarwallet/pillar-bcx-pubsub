const HashMap = require('hashmap');
const logger = require('./logger');
const redisService = require('../services/redisService');
let client;
let pendingTx = new HashMap();
let PENDING_TX = 'pendingTx';

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
  module.exports.pendingTx.set(key, value);
  client.hset(PENDING_TX, key, JSON.stringify(value));
}

module.exports.set = set;

function count() {
  return module.exports.pendingTx.count();
}

module.exports.count = count;

function get(key) {
  return module.exports.pendingTx.get(key);
}

module.exports.get = get;

function deleteFn(key) {
  client.hdel(PENDING_TX, key);
  return module.exports.pendingTx.delete(key);
}

module.exports.delete = deleteFn;


function has(key) {
  return module.exports.pendingTx.has(key);
}

module.exports.has = has;

function keys() {
  return module.exports.pendingTx.keys();
}

module.exports.keys = keys;

function values() {
  return module.exports.pendingTx.values();
}

module.exports.values = values;

function loadHash() {
  client.hgetall(PENDING_TX, function(err, obj) {
    if (obj) {
      let resultObj = Object.keys(obj).map(function(key) {
        return [key, JSON.parse(obj[key])];
      });
      module.exports.pendingTx = new HashMap(resultObj);
    }
  });
}

module.exports.loadHash = loadHash;

module.exports.pendingTx = pendingTx;

connect();
