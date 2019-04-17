
const HashMap = require('hashmap');
const logger = require('./logger');
const redisService = require('../services/redisService');
let client;
let assets = new HashMap();
let ASSET_FIELD = "assets"

function connect(){
    try {
    client = redisService.connectRedis();
    logger.info('ethService successfully connected to Redis server');
    client.on('error', err => {
        logger.error(`ethService failed with REDIS client error: ${err}`);
    })
    loadHash();
    } catch (e) {
    logger.error(e);
    }
}

module.exports.connect = connect;


async function set(key, value){
    await module.exports.assets.set(key, value)
    await client.hset(ASSET_FIELD, key, JSON.stringify(value))
    
}

module.exports.set = set;


async function count() {
   return module.exports.assets.count();
}

module.exports.count = count;


async function get(key) {
    return module.exports.assets.get(key);
}

module.exports.get = get;

async function has(key) {
  return module.exports.assets.has(key)
}

module.exports.has = has;

async function keys() {
  return module.exports.assets.keys();
}

module.exports.keys = keys;


async function values() {
  return module.exports.assets.values();
}

module.exports.values = values;

async function loadHash(){
    client.hgetall(ASSET_FIELD, function(err, obj) {
        if(obj){
            module.exports.assets = new HashMap(obj);
        }
    });
}

module.exports.loadHash = loadHash;

module.exports.assets = assets;

connect()
