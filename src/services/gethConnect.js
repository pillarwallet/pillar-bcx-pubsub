const Web3 = require('web3');
const colors = require('colors');
const logger = require('../utils/logger.js');
require('dotenv').config();

const gethURL = process.env.GETH_NODE_URL + ':' + process.env.GETH_NODE_PORT;

let web3;


function gethConnectDisplay() {
  logger.info('Connecting to geth node');
  return new Promise(((resolve, reject) => {
    module.exports.setWeb3WebsocketConnection()
      .then(() => {
        module.exports.web3.eth.getBlockNumber()
          .then((result) => {
            if (result != null) {
              logger.info(colors.green.bold(`Established connection with local Ethereum node!\nCurrent Block number :${result}\n`));
              resolve();
            } else {
              logger.error(colors.red.bold('Failed to establish connection with local Ethereum node :(\n'));
              reject();
            }
          })
          .catch((e) => { reject(e); });
      })
      .catch((e) => { 
        logger.error('gethConnect.gethConnectDisplay() failed: ' + e);
        reject(e); 
      });
  }));
}
module.exports.gethConnectDisplay = gethConnectDisplay;

function setWeb3WebsocketConnection() {
  return new Promise(((resolve, reject) => {
    try {
      web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
      module.exports.web3 = web3;
      logger.info('Successfully established connection to ' + gethURL + ' websocket');
      resolve();
    } catch (e) {
      logger.error(colors.red.bold(`${e}\nFailed to establish connection with local Ethereum node :(\n`));
      reject(e);
    }
  }));
}
module.exports.setWeb3WebsocketConnection = setWeb3WebsocketConnection;
