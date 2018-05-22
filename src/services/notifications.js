const request = require('request');
const logger = require('../utils/logger.js');
const colors = require('colors');
require('dotenv').config();

const serverKey = process.env.FCM_SERVER_KEY;

function sendNotification(hash, from, to, value, asset, contractAddress, status, nbConfirmations, toFCMIID) {
  return new Promise(((resolve, reject) => {
    try {
      if (toFCMIID !== 'FCMIID_not_found') {
        const json = module.exports.generateJSON(hash, from, to, value, asset, contractAddress, status, nbConfirmations, toFCMIID);
        const headers = module.exports.generatePOSTHeaders(serverKey);
        const options = module.exports.generatePOSTOptions(headers, json);
        module.exports.requestSendNotification(options)
          .then(() => {
            resolve();
          });
      } else {
        resolve();
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.sendNotification = sendNotification;

function requestSendNotification(options) {
  return new Promise(((resolve, reject) => {
    try {
      request(options, (error) => {
        if (error) {
          logger.info('error:', error);
          reject(error);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.requestSendNotification = requestSendNotification;

function generatePOSTHeaders() {
  const headers = {
    Authorization: `key = ${serverKey}`,
    'Content-Type': 'application/json',
  };
  return (headers);
}
module.exports.generatePOSTHeaders = generatePOSTHeaders;

function generatePOSTOptions(headers, json) {
  return {
    uri: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers,
    json,
  };
}
module.exports.generatePOSTOptions = generatePOSTOptions;

function generateJSON(hash, from, to, value, asset, contractAddress, status, nbConfirmations, toFCMIID) {
  const msg = {
    hash,
    from,
    to,
    value,
    asset,
    contractAddress,
    status,
    nbConfirmations,
  };
  logger.info(colors.white.bold('NEW NOTIFICATION FIRED:\n'));
  logger.info(`RECIPIENT: ${toFCMIID}`);
  logger.info('MESSAGE:');
  logger.info(msg);
  logger.info('\n');
  const data = {
    type: 'BCX',
    msg,
  };
  return {
    notification: {
      title: 'Transaction Notification',
      body: '',
      data,
    },
    to: toFCMIID,
  };
}
module.exports.generateJSON = generateJSON;
