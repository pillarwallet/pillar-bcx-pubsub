const logger = require('../utils/logger.js');
const ethTransactionsController = require('./transactions_ctrl.js');
const { exitRequestError } = require('../utils/routingHelpers');
const bcx = require('../services/bcx.js');


exports.getTxHistory = async (req, res, next) => {
  const urlParamsGet = req.query;
  const address = urlParamsGet.address1;
  const address2 = urlParamsGet.address2 || 'ALL';
  const asset = urlParamsGet.asset || 'ALL';
  const fromIndex = parseInt(urlParamsGet.fromIndex, 10) || 0;
  const nbTx = parseInt(urlParamsGet.nbTx, 10) || 10;
  const endIndex = fromIndex + nbTx;


  if (!address) {
    return exitRequestError(next, 'Wrong parameters provided');
  }
  logger.info(`GETTING TX HISTORY FOR ADDRESS :${address}, ASSET : ${asset}, ADDRESS 2 :${address2}`);

  try {
    const txHistoryResponse
      = await ethTransactionsController.getTxHistory(
        address.toUpperCase(), address2.toUpperCase(),
        asset,
        fromIndex,
        endIndex,
      );
    res.json({ result: 'success', txHistory: txHistoryResponse });
  } catch (e) { exitRequestError(next, e); }
};

exports.getBalance = web3 => (
  async (req, res, next) => {
	  const urlParamsGet = req.query;
	  const ethAddress = urlParamsGet.address;
	  const ticker = urlParamsGet.asset;
    const ERC20contractAddress = urlParamsGet.contractAddress; // WORKAROUND WHEN ERC20 CONTRACTS COLLECTION NOT WORKING

	  if (!ethAddress) {
		  return exitRequestError(next, 'Missing address');
	  }
	  if (!ticker) {
		  return exitRequestError(next, 'Missing asset');
	  }
    try {
		  ethTransactionsController.listPending()
		  .then((pendingTxArray) => {
			  const addressAssetPendingTxArray = [];

			  pendingTxArray.forEach((item) => {
				  if (item.asset === ticker && (item.to.toUpperCase() === ethAddress.toUpperCase() || item.from.toUpperCase() === ethAddress.toUpperCase())) {
					  addressAssetPendingTxArray.push(item);
				  }
			  });

			  bcx.getBalance(ethAddress, ticker, web3, ERC20contractAddress)
			  .then((balance) => {
				  let walletBalance = balance;
				  addressAssetPendingTxArray.forEach((pendingTx) => {
					  if (pendingTx.nbConfirmations > 0) {
						  walletBalance -= pendingTx.value;
					  }
				  });
				  const balanceData = {
					  ethAddress,
					  ticker,
					  balance: walletBalance,
				  };

				  res.json({ result: 'success', balance: balanceData });
			  })
			  .catch((e) => {
				  exitRequestError(next, e);
			  });
		  })
		  .catch((e) => {
			  exitRequestError(next, e);
		  });
	  } catch (e) { exitRequestError(next, e); }
  }
);

/* // GET BALANCE FROM DATABASE TRANSACTIONS
exports.getBalance = async (req, res, next) => {
  const urlParamsGet = req.query;
  const ethAddress = urlParamsGet.address;
  const assetTicker = urlParamsGet.asset;

  if (!ethAddress) {
    return exitRequestError(next, 'Missing address');
  } else if (!assetTicker) {
    return exitRequestError(next, 'Missing asset');
  }
  logger.info(`GETTING ${assetTicker} BALANCE FOR ADDRESS: ${ethAddress}`);
  try {
    const assetBalance = await ethTransactionsController.getBalance(ethAddress, assetTicker);
    logger.info(`${assetTicker} BALANCE = ${assetBalance}`);

    const balanceData = {
      ethAddress,
      assetTicker,
      balance: assetBalance,
    };

    res.json({ result: 'success', balance: balanceData });
  } catch (e) { exitRequestError(next, e); }
};
*/
