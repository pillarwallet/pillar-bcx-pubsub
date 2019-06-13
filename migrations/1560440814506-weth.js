const dbServices = require('../src/services/dbServices');
const logger = require('../src/utils/logger');

module.exports.up = function(next) {
  dbServices.dbConnect().then(() => {
    dbServices.dbCollections.assets
      .addContract({
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: '18',
        contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        protocol: 'Ethereum',
      })
      .then(() => {
        next();
      });
  });
};

module.exports.down = function(next) {
  dbServices.dbConnect().then(() => {
    dbServices.dbCollections.assets.findByTicker('WETH').then(asset => {
      asset.remove(e => {
        if (e) {
          logger.info(`Failed to remove asset ERROR: ${e}`);
        }
        logger.info('-->removed from database');
        next();
      });
    });
  });
};
