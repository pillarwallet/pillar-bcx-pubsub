const logger = require('../utils/logger.js');
const gasinfo = require('../models/gasinfo_model');
const mongoose = require('mongoose');

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
          resolve();
        });
      } catch (e) { reject(e); }
    });
  }
  module.exports.add = add;