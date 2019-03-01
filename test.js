const bluebird = require('bluebird');

// Redis
const redis = require('redis');
const redisOptions = {host: process.env.REDIS_SERVER, port: process.env.REDIS_PORT, password: process.env.REDIS_PW};
try {
  redis.createClient(redisOptions);
  logger.info("Successfully connected to Redis server")
} catch (e) { logger.error(e) }
bluebird.promisifyAll(redis);

client.getAsync('foo').then(function(res) {
    if(res) {
        console.log(res);
        client.del('foo')
    }
});