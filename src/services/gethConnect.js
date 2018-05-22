const Web3 = require('web3');
const colors = require('colors');
const logger = require('../utils/logger.js');

function gethConnectDisplay() {
  return new Promise(((resolve, reject) => {
    module.exports.setWeb3WebsocketConnection()
      .then((web3) => {
        web3.eth.getBlockNumber()
          .then((result) => {
            if (result != null) {
              logger.info(colors.green.bold(`Established connection with local Ethereum node!\nCurrent Block number :${result}\n`));
              resolve(web3);
            } else {
              logger.info(colors.red.bold('Failed to establish connection with local Ethereum node :(\n'));
              reject();
            }
          })
          .catch((e) => { reject(e); });
      })
      .catch((e) => { reject(e); });
  }));
}
module.exports.gethConnectDisplay = gethConnectDisplay;

function setWeb3WebsocketConnection() {
  return new Promise(((resolve, reject) => {
    try {
      const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://node.pillarproject.io:8546'));
      resolve(web3);
    } catch (e) {
      reject(e);
      logger.info(colors.red.bold(`${e}\nFailed to establish connection with local Ethereum node :(\n`));
    }
  }));
}
module.exports.setWeb3WebsocketConnection = setWeb3WebsocketConnection;
