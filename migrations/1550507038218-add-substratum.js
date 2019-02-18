'use strict'

var dbServices = require("../src/services/dbServices")
var logger = require("../src/utils/logger");

module.exports.up = function (next) {
  dbServices.dbConnect().then(() => {
    dbServices.dbCollections.assets.addContract({
      name: "SUBSTRATUM", symbol: "SUB", decimals: "18", contractAddress: "0x8D75959f1E61EC2571aa72798237101F084DE63a", protocol: "Ethereum"
    }).then(()=>{
      next()
    })
  })
}

module.exports.down = function (next) {
  dbServices.dbConnect().then(() => {
    dbServices.dbCollections.assets.findByTicker("SUB").then(asset => {
      asset.remove(e => {
        if (e) {
          logger.info(`Failed to remove asset ERROR: ${e}`);
        }
        logger.info("-->removed from database");
        next();
      });
    });
  })
}
