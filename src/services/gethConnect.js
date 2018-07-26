const Web3 = require('web3');
const colors = require('colors');
const logger = require('../utils/logger.js');
require('dotenv').config();

const gethURL = process.env.GETH_NODE_URL + ':' + process.env.GETH_NODE_PORT;

let web3;

function gethConnectDisplay() {
  logger.info('Connecting to geth node');
  return new Promise(((resolve, reject) => {
    if((web3 === undefined) || (!web3.isConnected())) {
      module.exports.setWeb3WebsocketConnection()
        .then(() => {
          module.exports.web3.eth.getBlockNumber()
            .then((result) => {
              if (result != null) {
                logger.info(`Established connection with local Ethereum node! Current Block number :${result}`);
                resolve();
              } else {
                logger.error('Failed to establish connection with local Ethereum node :');
                reject();
              }
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { 
          logger.error('gethConnect.gethConnectDisplay() failed: ' + e);
          reject(e); 
        }); 
    } else {
      logger.info('Connection to geth node already exists!!');
      resolve();
    }
  }));
}
module.exports.gethConnectDisplay = gethConnectDisplay;

function setWeb3WebsocketConnection() {
  return new Promise(((resolve, reject) => {
    try {
      web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
      module.exports.web3 = web3;
      web3._provider.on('end', (eventObj) => {
        logger.error('Websocket disconnected!! Restarting connection....');
        //logger.error(eventObj);
        //exports.setWeb3WebsocketConnection();
      });
      logger.info('Successfully established connection to ' + gethURL + ' websocket');
      resolve();
    } catch (e) {
      logger.error(`Failed to establish connection with local Ethereum node :${e}`);
      reject(e);
    }
  }));
}
module.exports.setWeb3WebsocketConnection = setWeb3WebsocketConnection;
