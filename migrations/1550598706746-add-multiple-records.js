'use strict'


const redis = require("redis");
let client = redis.createClient();
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);
var logger = require("../src/utils/logger");
var dbServices = require("../src/services/dbServices");
var latestIdKey = "latestId-1550598706746";

module.exports.up =  function (next) {
  
  var latestId
  var addingList = [
    {
      name: "SUBfsSTRATUM1s", symbol: "afadsfasf", decimals: "4", contractAddress: "1", protocol: "sdfsfsdf"
    },
    {
      name: "SUBSsfsTRATUM2f", symbol: "asfasf", decimals: "1", contractAddress: "2", protocol: "sfsdf"
    },
    {
      name: "SUBSTRsfsATUM3d", symbol: "gdgdd", decimals: "2", contractAddress: "3", protocol: "sfsdf"
    },
    {
      name: "SUBSTRATfsUM4a", symbol: "sfdsf", decimals: "3", contractAddress: "4", protocol: "Ethesfsdfreum"
    }
  ];
 client.getAsync(latestIdKey).then( (value) =>{
   if (value){
      logger.info('fetching last processed id from redis server' + value);
      latestId = parseInt(value)
  } else {
    logger.info('First run of the process, initializing last process id on redis');
    latestId = 0
  }
   dbServices.dbConnect().then(() => {
    addValues(addingList, latestId, next)
   })

})
}

function addValues(values, i, next){
  console.log("processing record "+ i)
  if (!values[i]){
    next()
    return
  }
  dbServices.dbCollections.assets.addContract(values[i]).then( () =>{
    client.setAsync(latestIdKey, (i+1).toString()).then(()=>{
        addValues(values, i + 1, next)
      })
    },()=>{process.exit(1)})
  }

module.exports.down = function (next) {
  next()
}
