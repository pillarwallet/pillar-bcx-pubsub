const logger = require('../utils/logger.js');
const gasinfo = require('../models/gasinfo_model');

function add(record) {
    logger.debug('GasInfo.adding a new record: ' + JSON.stringify(record));
    return new Promise((resolve, reject) => {
      try {
        const rec = new gasinfo.GasInfo(record);
        rec.save((err) => {
          if (err) {
            logger.info(`GasInfo.add DB controller ERROR: ${err}`);
            reject(err);
          }
          logger.debug('GasInfo: successfully added a new record');
          resolve();
        });
      } catch (e) { 
        logger.error('GasInfo: error ' + e);
        reject(e); 
      }
    });
  }
  module.exports.add = add;