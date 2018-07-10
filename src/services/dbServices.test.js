const sinon = require('sinon');

describe('Test dbConnect function', () => {
  test('dbConnect should call mongoose.connect once', (done) => {
    jest.mock('mongoose');
    const mongoose = require('mongoose');
    const dbServices = require('./dbServices.js');
    const url = 'mongodb://127.0.0.1:27017/PillarBCX';
    const arg = { useMongoClient: true };
    const spy = sinon.spy(mongoose, 'connect');
    return dbServices.dbConnect(arg)
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

});
/*
describe('Test dlTxHistory function', () => {
  test('Should call bcx.getBlockTx twice, dbServices.processTxHistory twice, dbCollections.ethTransactions.listHistory twice, processTx.checkPendingTx twice and resolve(34)', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const txHistoryArray = web3.txHistory;
    jest.mock('../controllers/accounts_ctrl.js');
    const ethAddresses = require('../controllers/accounts_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };

    const bcx = require('./bcx');
    const stub1 = sinon.stub(bcx, 'getBlockTx');
    stub1.resolves(txHistoryArray);
    const dbServices = require('./dbServices');
    const stub2 = sinon.stub(dbServices, 'processTxHistory');
    stub2.resolves(17);
    const stub3 = sinon.stub(ethTransactions, 'listHistory');
    stub3.resolves(txHistoryArray);
    const processTx = require('./processTx');
    const stub4 = sinon.stub(processTx, 'checkPendingTx');
    stub4.resolves();
    const maxBlock = web3.blockNumber + 1;
    let abiDecoder;
    let notif;
    return dbServices.dlTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, web3.blockNumber, maxBlock, 0)
      .then((result) => {
        sinon.assert.calledTwice(stub1);
        sinon.assert.calledTwice(stub2);
        sinon.assert.calledTwice(stub3);
        sinon.assert.calledTwice(stub4);
        expect(result).toEqual(2 * 17);
        stub1.restore();
        stub2.restore();
        stub3.restore();
        stub4.restore();
        done();
      });
  });

  test('Should resolve(0) and not call any function when startBlock > maxBlock', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const txHistoryArray = web3.txHistory;
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const dbCollections = { ethTransactions };

    const bcx = require('./bcx');
    const stub1 = sinon.stub(bcx, 'getBlockTx');
    stub1.resolves(txHistoryArray);
    const dbServices = require('./dbServices');
    const stub2 = sinon.stub(dbServices, 'processTxHistory');
    stub2.resolves(17);
    const stub3 = sinon.stub(ethTransactions, 'listHistory');
    stub3.resolves(txHistoryArray);
    const processTx = require('./processTx');
    const stub4 = sinon.stub(processTx, 'checkPendingTx');
    stub4.resolves();
    const maxBlock = web3.blockNumber - 1;
    let abiDecoder;
    let notif;
    return dbServices.dlTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, web3.blockNumber, maxBlock, 0)
      .then((result) => {
        sinon.assert.notCalled(stub1);
        sinon.assert.notCalled(stub2);
        sinon.assert.notCalled(stub3);
        sinon.assert.notCalled(stub4);
        expect(result).toEqual(0);
        stub1.restore();
        stub2.restore();
        stub3.restore();
        stub4.restore();
        done();
      });
  });
});

describe('Test processTxHistory function', () => {
  test('Should call processTx.newPendingTx 17 times and resolve(17)', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const dbServices = require('./dbServices.js');
    const txHistoryArray = web3.txHistory;
    const processTx = require('./processTx');
    const stub = sinon.stub(processTx, 'newPendingTx');
    stub.resolves(true);
    let dbCollections;
    let abiDecoder;
    let notif;
    return dbServices.processTxHistory(web3, processTx, txHistoryArray, dbCollections, abiDecoder, notif, 0, 0)
      .then((result) => {
        expect(result).toEqual(17);
        sinon.assert.callCount(stub, 17);
        stub.restore();
        done();
      });
  });
});

describe('Test updateTxHistory function', () => {
  test('Should call dbCollections.ethTransactions.findTxHistoryHeight once and call dlTxHistory  once', (done) => {
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const dbCollections = { ethTransactions };
    const dbServices = require('./dbServices.js');
    const spy1 = sinon.spy(ethTransactions, 'findTxHistoryHeight');
    const stub2 = sinon.stub(dbServices, 'dlTxHistory');
    stub2.resolves(8);
    let maxBlock;
    let abiDecoder;
    let notif;
    let processTx;
    let web3;
    let bcx;
    return dbServices.updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, maxBlock)
      .then(() => {
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(stub2);
        spy1.restore();
        stub2.restore();
        done();
      });
  });
});
*/
describe('Test getTxHistory function', () => {
  test('Should call ethTransactions.getTxHistory once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub = sinon.stub(ethTransactions, 'getTxHistory');
    stub.resolves({ TxHist: 'TxHistory' });
    return dbServices.getTxHistory('address1', 'fromtmstmp', 'address2', 'asset')
      .then(() => {
        sinon.assert.calledOnce(stub);
        stub.restore();
        done();
      });
  });
});

describe('Test listPendingTx function', () => {
  test('listPendingTx called for ETH should call ethTransactions.listPending once and return one mocked pending transaction', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const spy = sinon.spy(ethTransactions, 'listPending');
    return dbServices.listPendingTx('0x81b7E08F65Bdf5648606c89998A9CC8164397647', 'ETH')
      .then((result) => {
        expect(result.length).toEqual(1);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
  test('listPendingTx called for BOKKY token should call ethTransactions.listPending once and return one mocked pending tx', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const spy = sinon.spy(ethTransactions, 'listPending');
    return dbServices.listPendingTx('0x81b7E08F65Bdf5648606c89998A9CC8164397647', 'BOKKY')
      .then((result) => {
        expect(result.length).toEqual(2);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
});
describe('Test initDBTxHistoryfunction', () => {
  test('When NO_TX_HISTORY_HEIGHT is returned by findTxHistoryHeight, initDBTxHistory should call  txHistory.addZeroTxHistoryHeight() once and txHistory.findTxHistoryHeight once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const txHistory = require('../controllers/transactions_ctrl.js');
    const stub = sinon.stub(txHistory, 'addZeroTxHistoryHeight');
    stub.resolves();
    const stub2 = sinon.stub(txHistory, 'findTxHistoryHeight');
    stub2.resolves('NO_TX_HSTORY_HEIGHT');
    return dbServices.initDBTxHistory()
      .then(() => {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledOnce(stub2);
        stub.restore();
        stub2.restore();
        done();
      });
  });

  test('When blockNb is returned by findTxHistoryHeight, initDBTxHistory should NOT call txHistory.addZeroTxHistoryHeight() and call txHistory.findTxHistoryHeight once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const txHistory = require('../controllers/transactions_ctrl.js');
    const stub = sinon.stub(txHistory, 'addZeroTxHistoryHeight');
    stub.resolves();
    const stub2 = sinon.stub(txHistory, 'findTxHistoryHeight');
    stub2.resolves('blockNb');
    return dbServices.initDBTxHistory()
      .then(() => {
        sinon.assert.notCalled(stub);
        sinon.assert.calledOnce(stub2);
        stub.restore();
        stub2.restore();
        done();
      });
  });
});

describe('Test emptyDBTxHistory function', () => {
  test('Should call  ethTransactions.emptyCollection() once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const txHistory = require('../controllers/transactions_ctrl.js');
    const stub = sinon.stub(txHistory, 'emptyCollection');
    stub.resolves();
    return dbServices.emptyDBTxHistory()
      .then(() => {
        sinon.assert.calledOnce(stub);
        stub.restore();
        done();
      });
  });
});

describe('Test resetDBTxHistory function', () => {
  test('Should call dbServices.emptyDBTxHistory() once and dbServices.initDBTxHistory() once', (done) => {
    const dbServices = require('./dbServices.js');
    const stub = sinon.stub(dbServices, 'emptyDBTxHistory');
    stub.resolves();
    const stub2 = sinon.stub(dbServices, 'initDBTxHistory');
    stub2.resolves();
    return dbServices.resetDBTxHistory()
      .then(() => {
        sinon.assert.calledOnce(stub);
        stub.restore();
        sinon.assert.calledOnce(stub2);
        stub2.restore();
        done();
      });
  });
});

describe('Test initDBERC20SmartContracts function', () => {
  test('When NO_ERC20_CONTRACTS_HISTORY_HEIGHT is returned by findERC20SmartContractsHistoryHeight, initDBERC20SmartContracts should call  smartContracts.addZeroSmartContractsCreationHistoryHeight() once and smartContracts.findERC20SmartContractsHistoryHeight once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const stub = sinon.stub(smartContracts, 'addZeroSmartContractsCreationHistoryHeight');
    stub.resolves();
    const stub2 = sinon.stub(smartContracts, 'findERC20SmartContractsHistoryHeight');
    stub2.resolves('NO_ERC20_CONTRACTS_HISTORY_HEIGHT');
    return dbServices.initDBERC20SmartContracts()
      .then(() => {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledOnce(stub2);
        stub.restore();
        stub2.restore();
        done();
      });
  });

  test('When blockNb is returned by findERC20SmartContractsHistoryHeight, initDBERC20SmartContracts should NOT call smartContracts.addZeroSmartContractsCreationHistoryHeight() and call smartContracts.findERC20SmartContractsHistoryHeight once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const stub = sinon.stub(smartContracts, 'addZeroSmartContractsCreationHistoryHeight');
    stub.resolves();
    const stub2 = sinon.stub(smartContracts, 'findERC20SmartContractsHistoryHeight');
    stub2.resolves('blockNb');
    return dbServices.initDBERC20SmartContracts()
      .then(() => {
        sinon.assert.notCalled(stub);
        sinon.assert.calledOnce(stub2);
        stub.restore();
        stub2.restore();
        done();
      });
  });
});

describe('Test emptyDBERC20SmartContracts function', () => {
  test('Should call  smartContracts.emptyCollection() once', (done) => {
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const stub = sinon.stub(smartContracts, 'emptyCollection');
    stub.resolves();
    return dbServices.emptyDBERC20SmartContracts()
      .then(() => {
        sinon.assert.calledOnce(stub);
        stub.restore();
        done();
      });
  });
});

describe('Test resetDBERC20SmartContracts function', () => {
  test('Should call dbServices.emptyDBERC20SmartContracts() once and dbServices.initDBERC20SmartContracts() once', (done) => {
    const dbServices = require('./dbServices.js');
    const stub = sinon.stub(dbServices, 'emptyDBERC20SmartContracts');
    stub.resolves();
    const stub2 = sinon.stub(dbServices, 'initDBERC20SmartContracts');
    stub2.resolves();
    return dbServices.resetDBERC20SmartContracts()
      .then(() => {
        sinon.assert.calledOnce(stub);
        stub.restore();
        sinon.assert.calledOnce(stub2);
        stub2.restore();
        done();
      });
  });
});
/*
describe('Test dlERC20SmartContracts function', () => {
  test('Should call web3.eth.getBlock, bcx.getBlockSmartContractsAddressesArray and dbServices.processSmartContractsAddressesArray 10 times, then return 10', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const bcx = require('./bcx.js');
    const dbServices = require('./dbServices.js');
    let dbCollections;
    const stub = sinon.stub(web3.eth, 'getBlock');
    stub.resolves({ transactions: ['txHash'] });
    const stub2 = sinon.stub(bcx, 'getBlockSmartContractsAddressesArray');
    stub2.resolves(['smartContractsAddressesArray']);
    const stub3 = sinon.stub(dbServices, 'processSmartContractsAddressesArray');
    stub3.resolves(1);
    let processTx;
    let notif;
    let gethSubscribe;
    return dbServices.dlERC20SmartContracts(web3, gethSubscribe, bcx, processTx, notif, 0, 9, dbCollections, 0)
      .then((result) => {
        expect(result).toEqual(10);
        sinon.assert.callCount(stub, 10);
        sinon.assert.callCount(stub2, 10);
        sinon.assert.callCount(stub3, 10);
        stub.restore();
        stub2.restore();
        stub3.restore();
        done();
      });
  });
});
*/

// CONSTRUCTOR ISSUE
/*
describe('Test processSmartContractsAddressesArray function', function() {
    test('Should call smartContracts.addContract once', function(done) {
        jest.mock('web3')
        let web3 = require('web3');
        jest.mock('../controllers/assets_ctrl.js')
        let smartContracts = require('../controllers/assets_ctrl.js')
        stub = sinon.stub(smartContracts,'addContract')
        stub.resolves()

        return dbServices.processSmartContractsAddressesArray(web3,smartContracts,['smartContractsAddressesArray'],0,0)
        .then(function(result){
            expect(result).toEqual(1)
            sinon.assert.callCount(stub,1)
            stub.restore()
            done();
        })
    });
});
*/

/*
describe('Test updateERC20SmartContracts function', () => {
  test('Should call smartContracts.findERC20SmartContractsHistoryHeight once and dbServices.dlERC20SmartContracts once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const bcx = require('./bcx.js');
    const dbServices = require('./dbServices.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const stub = sinon.stub(smartContracts, 'findERC20SmartContractsHistoryHeight');
    const dbCollections = { smartContracts };
    stub.resolves(0);
    const stub2 = sinon.stub(dbServices, 'dlERC20SmartContracts');
    stub2.resolves(99);
    let processTx;
    let notif;
    let gethSubscribe;
    return dbServices.updateERC20SmartContracts(web3, gethSubscribe, bcx, processTx, notif, dbCollections, 999)
      .then(() => {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledOnce(stub2);
        stub.restore();
        stub2.restore();
        done();
      });
  });
});
*/
