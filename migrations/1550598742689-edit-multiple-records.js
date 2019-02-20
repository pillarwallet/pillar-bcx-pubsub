'use strict'


const redis = require("redis");
let client = redis.createClient();
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);
var logger = require("../src/utils/logger");
var dbServices = require("../src/services/dbServices");
var latestIdKey = "latestId-1550598742689";

module.exports.up = function (next) {

  var latestId

  client.getAsync(latestIdKey).then((value) => {
    if (value) {
      logger.info('fetching last processed id from redis server' + value);
      latestId = value
    } else {
      logger.info('First run of the process, initializing last process id on redis');
      latestId = ''
    }
    dbServices.dbConnect().then(() => {
      editValues(latestId, next)
    })

  })
}

function editValues(latestId, next) {
  console.log("processing record " + i);
  if (!values[i]) {
    next();
    return;
  }
  dbServices.dbCollections.accounts.listRecent(latestId).then(
    () => {
        editValues(values, i + 1, next);
    },
    () => {
      process.exit(1);
    }
  );
}

module.exports.down = function (next) {
  next()
}
