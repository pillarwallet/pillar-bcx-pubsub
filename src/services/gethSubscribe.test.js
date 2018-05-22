const gethSubscribe = require('./gethSubscribe.js');
const sinon = require('sinon');

describe('Test subscribePendingTx funtion', () => {
  test("subscribePendingTx function should call bcx.getTxInfo and processTx.newPendingTx once (because of a mocked 'new pending transaction' event being fired by web3 mock)", (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const bcx = require('../services/bcx.js');
    const processTx = require('./processTx');
    let ethAddresses;
    let smartContracts;
    jest.mock('../controllers/ethTransactions_ctrl.js');
    const ethTransactions = require('../controllers/ethTransactions_ctrl.js');
    let abiDecoder;
    let circuitBreaker;
    const stub1 = sinon.stub(bcx, 'getTxInfo');
    stub1.resolves(web3.transactions[0]);
    const stub2 = sinon.stub(processTx, 'newPendingTx');
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    const stub3 = sinon.stub(bcx, 'getPendingTxArray');
    stub3.resolves(web3.poolTransactions);
    const stub4 = sinon.stub(dbCollections.ethTransactions, 'listDbZeroConfTx');
    stub4.resolves(web3.transactions);
    const stub5 = sinon.stub(processTx, 'processNewPendingTxArray');
    stub5.resolves();
    const notif = require('./notifications.js');
    return gethSubscribe.subscribePendingTx(web3, bcx, processTx, dbCollections, abiDecoder, circuitBreaker, notif)
      .then(() => {
        sinon.assert.callCount(stub1, web3.transactions.length);
        sinon.assert.callCount(stub2, web3.transactions.length);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(stub4);
        sinon.assert.calledOnce(stub5);
        stub1.restore();
        stub2.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
        done();
      });
  });
});

describe('Test subscribeBlockHeaders function', () => {
  test('subscribeBlockHeaders function should call bcx.getBlockTx, dbCollections.ethTransactions.listDbZeroConfTx, dbCollections.ethTransactions.listPending dbCollections.ethTransactions.updateTxHistoryHeight, processTx.checkBlockTx and processTx.checkPendingTx thrice, and call dbServices.updateTxHistory once', (done) => {
    jest.mock('web3');
    jest.mock('../controllers/ethTransactions_ctrl.js');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/smartContracts_ctrl.js');
    const web3 = require('web3');
    const bcx = require('../services/bcx.js');
    const processTx = require('./processTx');
    const dbServices = require('../services/dbServices.js');

    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');

    const ethTransactions = require('../controllers/ethTransactions_ctrl.js');

    const smartContracts = require('../controllers/smartContracts_ctrl.js');
    const dbCollections = { ethAddresses, ethTransactions, smartContracts };
    const spy3 = sinon.spy(dbCollections.ethTransactions, 'listPending');
    const spy4 = sinon.spy(dbCollections.ethTransactions, 'updateTxHistoryHeight');
    const stub1 = sinon.stub(processTx, 'checkPendingTx');
    stub1.resolves();
    const stub2 = sinon.stub(dbServices, 'updateTxHistory');
    stub2.resolves();
    const spy2 = sinon.spy(dbServices, 'updateERC20SmartContracts');
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(dbServices, 'dlERC20SmartContracts');
    stub4.resolves();
    const stub5 = sinon.stub(dbCollections.smartContracts, 'updateERC20SmartContractsHistoryHeight');
    stub5.resolves();
    let abiDecoder;
    return gethSubscribe.subscribeBlockHeaders(web3, gethSubscribe, bcx, processTx, dbServices, dbCollections, abiDecoder, notif, true)
      .then(() => {
        // sinon.assert.callCount(spy2,1) //FUNCTION DISABLED TEMPORARILY
        sinon.assert.callCount(spy3, 3);
        sinon.assert.callCount(spy4, 3);
        sinon.assert.callCount(stub1, 3);
        sinon.assert.calledOnce(stub2);
        // sinon.assert.callCount(stub4,4) //FUNCTION DISABLED TEMPORARILY
        // sinon.assert.calledThrice(stub5) //FUNCTION DISABLED TEMPORARILY
        spy3.restore();
        spy4.restore();
        stub1.restore();
        stub2.restore();
        stub4.restore();
        stub5.restore();
        done();
      });
  });
});
describe('Test subscribeAllDBERC20SmartContracts function', () => {
  test('subscribeAllDBERC20SmartContracts Should call dbCollections.smartContracts.listAll() once and subscribeERC20SmartContract thrice', (done) => {
    jest.mock('../controllers/smartContracts_ctrl.js');
    const smartContracts = require('../controllers/smartContracts_ctrl.js');
    const dbCollections = { smartContracts };
    const stub1 = sinon.stub(dbCollections.smartContracts, 'listAll');
    stub1.resolves(['smaco1', 'smaco2', 'smaco3']);
    const gethSubscribe = require('./gethSubscribe.js');
    const stub2 = sinon.stub(gethSubscribe, 'subscribeERC20SmartContract');
    stub2.resolves();
    let web3;
    let bcx;
    let processTx;
    let notif;
    return gethSubscribe.subscribeAllDBERC20SmartContracts(web3, bcx, processTx, dbCollections, notif)
      .then(() => {
        sinon.assert.callCount(stub2, 3);
        sinon.assert.calledOnce(stub1);
        stub1.restore();
        stub2.restore();
        done();
      });
  });
});


