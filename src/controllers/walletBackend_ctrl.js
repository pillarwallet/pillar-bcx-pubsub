const ethAddressesController = require('./ethAddresses_ctrl');

const { exitRequestError } = require('../utils/routingHelpers');

async function registerNewWallet(req, res, next) {
  const pillarId = req.body.pillarId || '';
  const ethAddress = req.body.ethAddress || '';
  const fcmIID = req.body.fcmIID || '';

  if (!pillarId || !ethAddress || !fcmIID) {
    return exitRequestError(next, 'Wrong parameters provided');
  }

  try {
    ethAddressesController.addAddress(pillarId, ethAddress, fcmIID)
      .then(() => {
      	res.json({ result: 'success', message: 'NEW ACCOUNT REGISTERED!' });
      });
  } catch (e) { exitRequestError(next, e); }

  // THE FOLLOWING IS TO DL TX HISTORY FOR NEW ADDRESS AT REGISTRATION (ON HOLD AT THE MOMENT)
  /*
      .then(() => {

        bcx.getPendingTxArray(web3) // SEND MSG TO PRODUCTION SEGMENT

          .then((pendingTxArray) => {
            //CHECK IF TX ALREADY IN DB
            unknownPendingTxArray=[]
            dbCollections.ethTransactions.listDbZeroConfTx()
              .then((dbPendingTxArray) => {
                pendingTxArray.forEach((pendingTx) => {
                  isDbPendingTx=false
                  dbPendingTxArray.forEach((dbPendingTx) => {
                    if(pendingTx==dbPendingTx){
                      isDbPendingTx=true
                    }
                  })
                  if(isDbPendingTx==false){
                    unknownPendingTxArray.push(pendingTx)
                  }
                })
                processTx.processNewPendingTxArray(web3,unknownPendingTxArray,dbCollections,abiDecoder,circuitBreaker,notif,0,ethAddress)
                  .then((nbTxFound) => {
                    console.log('DONE UPDATING PENDING TX IN DATABASE FOR NEW ADDRESS ' + ethAddress + '\n--> '+nbTxFound+' transactions found\n')
                    bcx.getLastBlockNumber(web3)
                      .then((lastBlockNb) => {
                        dbServices.dlTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, circuitBreaker, false, 0, lastBlockNb, 0, ethAddress) // SEND MSG TO PRODUCTION SEGMENT
                          .then(() => {
                            console.log('DONE UPDATING MINED TX IN DATABASE FOR NEW ADDRESS ' + ethAddress)

                            res.json({result: 'success', message: 'NEW ACCOUNT REGISTERED!'});

                          })
                          .catch((e) => {
                            exitRequestError(next, e);
                          });
                      })
                      .catch((e) => {
                        exitRequestError(next, e);
                      });
                  })
                  .catch((e) => {
                    exitRequestError(next, e);
                  });
              })
              .catch((e) => {
                exitRequestError(next, e);
              });
          })
          .catch((e) => {
            exitRequestError(next, e);
          });

      })
      .catch((e) => {
        exitRequestError(next, e);
      });
      */
}
module.exports.registerNewWallet = registerNewWallet;

async function unregisterWallet(req, res, next) {
  const pillarId = req.body.pillarId || '';
  if (!pillarId) {
    return exitRequestError(next, 'Wrong parameters provided');
  }
  try {
    ethAddressesController.findByWalletId(pillarId)
	  .then((wallet) => {
		  if (!wallet) {
			  return exitRequestError(next, 'Invalid wallet Id');
		  }
		  ethAddressesController.removeAddress(pillarId)
		  .then(() => {
			  res.json({ result: 'success', message: 'WALLET UN-REGISTERED' });
		  });
	  });
  } catch (e) { exitRequestError(next, e); }
}
module.exports.unregisterWallet = unregisterWallet;

async function updatefcmiid(req, res, next) {
  const pillarId = req.body.pillarId || '';
  const newFCMIID = req.body.FCMIID || '';

  if (!pillarId || !newFCMIID) {
    return exitRequestError(next, 'Wrong parameters provided');
  }

  try {
    await ethAddressesController.updateFCMIID(pillarId, newFCMIID);
    res.json({ result: 'success', message: 'FCMIID UPDATED' });
  } catch (e) { exitRequestError(next, e); }
}
module.exports.updatefcmiid = updatefcmiid;

