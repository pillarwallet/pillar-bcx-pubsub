const processTx = require('./processTx.js');
const sinon = require('sinon');

describe('Test filterAddress function', () => {
  test("When a Pillar wallet address is passed, filterAddress should call ethAddresses.findByAddress once then NOT call smartContracts.findByAddress and return {'isPillarAddress' : true, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    jest.mock('web3');
    const web3 = require('web3');
    const spy1 = sinon.spy(ethAddresses, 'findByAddress');
    const spy2 = sinon.spy(smartContracts, 'findByAddress');
    const address = web3.addresses[0].address;
    return processTx.filterAddress(address, ethAddresses, smartContracts)
      .then((result) => {
        expect(result).toEqual({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
        sinon.assert.calledOnce(spy1);
        sinon.assert.notCalled(spy2);
        spy1.restore();
        spy2.restore();
        done();
      });
  });

  test("When a smart contract address is passed, filterAddress should call ethAddresses.findByAddress once then call smartContracts.findByAddress once and return {'isPillarAddress' : false, 'isERC20SmartContract' : true, 'ERC20SmartContractTicker': 'ticker'}", (done) => {
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    jest.mock('web3');
    const web3 = require('web3');
    const stub1 = sinon.stub(ethAddresses, 'findByAddress');
    stub1.resolves();
    const spy2 = sinon.spy(smartContracts, 'findByAddress');
    const address = web3.contracts[0].address;
    const ticker = web3.contracts[0].ticker;
    return processTx.filterAddress(address, ethAddresses, smartContracts)
      .then((result) => {
        expect(result).toEqual({
          isPillarAddress: false, isERC20SmartContract: true, ERC20SmartContractTicker: ticker,
        });
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(spy2);
        stub1.restore();
        spy2.restore();
        done();
      });
  });

  test("When an unknown address is passed, filterAddress should call ethAddresses.findByAddress once then call smartContracts.findByAddress once and return {'isPillarAddress' : false, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    jest.mock('web3');
    const stub1 = sinon.stub(ethAddresses, 'findByAddress');
    stub1.resolves();
    const stub2 = sinon.stub(smartContracts, 'findByAddress');
    stub2.resolves();
    const address = 'notAPillarAddress';
    return processTx.filterAddress(address, ethAddresses, smartContracts)
      .then((result) => {
        expect(result).toEqual({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub2);
        stub1.restore();
        stub2.restore();
        done();
      });
  });
});


describe('Test newPendingTx function', () => {
  test('When a transaction object involving 2 pillar addresses is passed, newPendingTx should call processTx.filterAddress twice and  call ethTransactions.addTx once and call notif.sendNotification once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = web3.transactions[0];
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(notif, 'sendNotification');
    stub4.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(stub4);
        stub4.restore();
        stub1.restore();
        stub3.restore();
        done();
      });
  });

  test('When sendNotif=false is passed with a transaction object involving 2 pillar addresses, newPendingTx should call processTx.filterAddress twice and  call ethTransactions.addTx once and NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = web3.transactions[0];
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(notif, 'sendNotification');
    stub4.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif, false)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.calledOnce(stub3);
        sinon.assert.notCalled(stub4);
        stub4.restore();
        stub1.restore();
        stub3.restore();
        done();
      });
  });

  test('When a transaction object involving 1 pillar address as the recipient is passed, newPendingTx should call processTx.filterAddress twice then call ethTransactions.addTx once and call notif.sendNotification once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = web3.transactions[0];
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(notif, 'sendNotification');
    stub4.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(stub4);
        stub4.restore();
        stub1.restore();
        stub3.restore();
        done();
      });
  });

  test('When a transaction object involving 2 pillar address as the sender is passed, newPendingTx should call processTx.filterAddress twice then call ethTransactions.addTx once and NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = web3.transactions[0];
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(notif, 'sendNotification');
    stub4.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.calledOnce(stub3);
        sinon.assert.notCalled(stub4);
        stub4.restore();
        stub1.restore();
        stub3.restore();
        done();
      });
  });

  test('When a transaction object not involving any pillar address is passed, newPendingTx should call processTx.filterAddress twice and NOT call ethTransactions.addTx and NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = web3.transactions[0];
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub4 = sinon.stub(notif, 'sendNotification');
    stub4.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.notCalled(stub3);
        sinon.assert.notCalled(stub4);
        stub4.restore();
        stub1.restore();
        stub3.restore();
        done();
      });
  });

  test('When a transaction object involving a pillar address as the sender and an ERC20 smart contract as the recipient, newPendingTx should call processTx.filterAddress twice and call ethTransactions.addTx once and NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const tx = web3.nonZeroValueContractCall;
    const abi = web3.contracts[1].abi;
    const ticker = web3.contracts[1].ticker;
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const spy1 = sinon.spy(abiDecoder, 'addABI');
    const spy2 = sinon.spy(abiDecoder, 'decodeMethod');
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({
      isPillarAddress: false, isERC20SmartContract: true, ERC20SmartContractTicker: ticker,
    });
    stub1.onSecondCall().resolves({
      isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '',
    });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub2 = sinon.stub(ethTransactions, 'addTx');
    stub2.resolves();
    const notif = require('./notifications.js');
    const stub3 = sinon.stub(notif, 'sendNotification');
    stub3.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.calledOnce(stub2);
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);
        sinon.assert.notCalled(stub3);
        stub3.restore();
        stub1.restore();
        stub2.restore();
        spy1.restore();
        spy2.restore();
        done();
      });
  });

  test('When a transaction object involving an unknown address as the sender and an ERC20 smart contract as the recipient, newPendingTx should call processTx.filterAddress twice and call ethTransactions.addTx once and NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const tx = web3.nonZeroValueContractCall;
    const abi = web3.contracts[1].abi;
    const ticker = web3.contracts[1].ticker;
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const spy1 = sinon.spy(abiDecoder, 'addABI');
    const spy2 = sinon.spy(abiDecoder, 'decodeMethod');
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({
      isPillarAddress: false, isERC20SmartContract: true, ERC20SmartContractTicker: ticker,
    });
    stub1.onSecondCall().resolves({
      isPillarAddress: false, isERC20SmartContract: false,
    });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.notCalled(stub3);
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);
        sinon.assert.notCalled(stub5);
        stub5.restore();
        stub1.restore();
        stub3.restore();
        spy1.restore();
        spy2.restore();
        done();
      });
  });

  test('When a transaction object involving a token transfer from an unknown address to a pillar address is passed, newPendingTx should call processTx.filterAddress twice and call ethTransactions.addTx once and call circuitBreaker.circuitBreaker once and call notif.sendNotification once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const tx = web3.zeroValueContractCall;
    const abi = web3.contracts[1].abi;
    const ticker = web3.contracts[1].ticker;
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const spy1 = sinon.spy(abiDecoder, 'addABI');
    const stub2 = sinon.stub(abiDecoder, 'decodeMethod');
    stub2.returns({ name: 'transfer', params: [{ value: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C' }, { value: '10000000000' }] });
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({
      isPillarAddress: false, isERC20SmartContract: true, ERC20SmartContractTicker: ticker,
    });
    stub1.onSecondCall().resolves({
      isPillarAddress: false, isERC20SmartContract: false,
    });
    stub1.onThirdCall().resolves({
      isPillarAddress: true, isERC20SmartContract: false,
    });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 3);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(stub2);
        sinon.assert.calledOnce(stub5);
        stub5.restore();
        stub1.restore();
        stub3.restore();
        spy1.restore();
        stub2.restore();
        done();
      });
  });

  test('When a transaction object involving a token transfer between two pillar addresses is passed, newPendingTx should call processTx.filterAddress twice and call ethTransactions.addTx once and call notif.sendNotification once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const tx = web3.zeroValueContractCall;
    const abi = web3.contracts[1].abi;
    const ticker = web3.contracts[1].ticker;
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const spy1 = sinon.spy(abiDecoder, 'addABI');
    const stub2 = sinon.stub(abiDecoder, 'decodeMethod');
    stub2.returns({ name: 'transfer', params: [{ value: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C' }, { value: '10000000000' }] });
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.onFirstCall().resolves({
      isPillarAddress: false, isERC20SmartContract: true, ERC20SmartContractTicker: ticker,
    });
    stub1.onSecondCall().resolves({
      isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '',
    });
    stub1.onThirdCall().resolves({
      isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '',
    });
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const stub3 = sinon.stub(ethTransactions, 'addTx');
    stub3.resolves();
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
    return processTx.newPendingTx(web3, tx, dbCollections, abiDecoder, notif)
      .then(() => {
        sinon.assert.callCount(stub1, 3);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(stub2);
        sinon.assert.calledOnce(stub5);
        stub5.restore();
        stub1.restore();
        stub3.restore();
        spy1.restore();
        stub2.restore();
        done();
      });
  });
});

describe('Test checkPendingTx function', () => {
  test('When transaction has 1less than 5 block confirmations, checkPendingTx should call bcx.getTxInfo twice then call web3.utils.hexToNumberString twice then call bcx.getTxReceipt twice then call bcx.getBlockNumber twice then call ethTransactions.updateTx twice then NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.transactions[0]);
    stub2.onSecondCall().resolves(web3.transactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const spy2 = sinon.spy(web3.utils, 'hexToNumberString');
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber - 1);
    const spy3 = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const blockNumber = web3.blockNumber;
    const dbCollections = { ethAddresses, ethTransactions };
    return ethTransactions.listPending()
      .then(pendingTxArray => processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif)
        .then(() => {
          sinon.assert.callCount(stub2, 3);
          sinon.assert.callCount(stub3, 3);
          sinon.assert.callCount(stub4, 3);
          sinon.assert.notCalled(stub5);
          stub5.restore();
          sinon.assert.callCount(spy2, 3);
          sinon.assert.callCount(spy3, 3);
          stub2.restore();
          stub3.restore();
          stub4.restore();
          spy2.restore();
          spy3.restore();
          done();
        }));
  });

  test('When transaction has 5 or more block confirmations, checkPendingTx should call bcx.getTxInfo twice then call web3.utils.hexToNumberString thrice then call bcx.getTxReceipt twice then call bcx.getBlockNumber thrice then call ethTransactions.updateTx thrice then call notif.sendNotification 6 times', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.transactions[0]);
    stub2.onSecondCall().resolves(web3.transactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const spy2 = sinon.spy(web3.utils, 'hexToNumberString');
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber - 6);
    const spy3 = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const blockNumber = web3.blockNumber;
    const dbCollections = { ethAddresses, ethTransactions };
    return ethTransactions.listPending()
      .then(pendingTxArray => processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif)
        .then(() => {
          sinon.assert.callCount(stub2, 3);
          sinon.assert.callCount(stub3, 3);
          sinon.assert.callCount(stub4, 3);
          sinon.assert.callCount(stub5, 6);
          stub5.restore();
          sinon.assert.callCount(spy2, 3);
          sinon.assert.callCount(spy3, 3);
          stub2.restore();
          stub3.restore();
          stub4.restore();
          spy2.restore();
          spy3.restore();
          done();
        }));
  });

  test('When sendNotif=false is passed, checkPendingTx should call bcx.getTxInfo twice then call web3.utils.hexToNumberString thrice then call bcx.getTxReceipt twice then call bcx.getBlockNumber thrice then call ethTransactions.updateTx thrice then NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.transactions[0]);
    stub2.onSecondCall().resolves(web3.transactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const spy2 = sinon.spy(web3.utils, 'hexToNumberString');
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber - 6);
    const spy3 = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const blockNumber = web3.blockNumber;
    const dbCollections = { ethAddresses, ethTransactions };
    return ethTransactions.listPending()
      .then(pendingTxArray => processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif, false)
        .then(() => {
          sinon.assert.callCount(stub2, 3);
          sinon.assert.callCount(stub3, 3);
          sinon.assert.callCount(stub4, 3);
          sinon.assert.notCalled(stub5);
          stub5.restore();
          sinon.assert.callCount(spy2, 3);
          sinon.assert.callCount(spy3, 3);
          stub2.restore();
          stub3.restore();
          stub4.restore();
          spy2.restore();
          spy3.restore();
          done();
        }));
  });

  test('When txInfo.blockNumber>lastBlockNumber , checkPendingTx should call bcx.getTxInfo twice then call web3.utils.hexToNumberString twice then call bcx.getTxReceipt twice then call bcx.getBlockNumber twice then NOT call ethTransactions.updateTx then NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.transactions[0]);
    stub2.onSecondCall().resolves(web3.transactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const spy2 = sinon.spy(web3.utils, 'hexToNumberString');
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber + 2);
    const spy3 = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();
    const blockNumber = web3.blockNumber;
    const dbCollections = { ethAddresses, ethTransactions };
    return ethTransactions.listPending()
      .then(pendingTxArray => processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif)
        .then(() => {
          sinon.assert.callCount(stub2, 3);
          sinon.assert.callCount(stub3, 3);
          sinon.assert.callCount(stub4, 3);
          sinon.assert.notCalled(stub5);
          stub5.restore();
          sinon.assert.callCount(spy2, 3);
          sinon.assert.notCalled(spy3);
          stub2.restore();
          stub3.restore();
          stub4.restore();
          spy2.restore();
          spy3.restore();
          done();
        }));
  });

  test('Whwn smart contract calls are identified, checkPendingTx should call bcx.getTxInfo twice then call web3.utils.hexToNumberString twice then call bcx.getTxReceipt twice then  call bcx.getBlockNumbertwice then call ethTransactions.updateTx twice then call notif.sendNotification 6 times', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.transactions[0]);
    stub2.onSecondCall().resolves(web3.transactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const stub5 = sinon.stub(web3.utils, 'hexToNumberString');
    stub5.returns('0'); // SMART CONTRACT CALL
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber - 6);
    const spy3 = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub6 = sinon.stub(notif, 'sendNotification');
    stub6.resolves();
    const blockNumber = web3.blockNumber;
    const dbCollections = { ethAddresses, ethTransactions };
    return ethTransactions.listPending()
      .then(pendingTxArray => processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif)
        .then(() => {
          sinon.assert.callCount(stub2, 3);
          sinon.assert.callCount(stub3, 3);
          sinon.assert.callCount(stub4, 3);
          sinon.assert.callCount(stub5, 3);
          sinon.assert.callCount(stub6, 6);
          stub6.restore();
          sinon.assert.callCount(spy3, 3);
          stub2.restore();
          stub3.restore();
          stub4.restore();
          stub5.restore();
          spy3.restore();
          done();
        }));
  });

  test('When transactions are still pensding, checkPendingTx should NOT call bcx.getTxInfo then NOT call web3.utils.hexToNumberString then NOT call bcx.getTxReceipt then NOT call bcx.getBlockNumber then NOT call ethTransactions.updateTx then NOT call notif.sendNotification', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const bcx = require('.//bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.onFirstCall().resolves(web3.poolTransactions[0]);
    stub2.onSecondCall().resolves(web3.poolTransactions[1]);
    stub2.onThirdCall().resolves(web3.transactions[2]);
    const stub5 = sinon.stub(web3.utils, 'hexToNumberString');
    stub5.returns('0');
    const stub3 = sinon.stub(bcx, 'getTxReceipt');
    stub3.resolves(web3.txReceipt);
    const stub4 = sinon.stub(bcx, 'getBlockNumber');
    stub4.resolves(web3.blockNumber + 2);
    const spy = sinon.spy(ethTransactions, 'updateTx');
    const notif = require('./notifications.js');
    const stub6 = sinon.stub(notif, 'sendNotification');
    stub6.resolves();
    const blockNumber = web3.blockNumber;
    const pendingTxArray = [];
    const dbCollections = { ethAddresses, ethTransactions };
    return processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockNumber, notif)
      .then(() => {
        sinon.assert.notCalled(stub2);
        sinon.assert.notCalled(stub3);
        sinon.assert.notCalled(stub4);
        sinon.assert.notCalled(stub5);
        sinon.assert.notCalled(stub6);
        stub6.restore();
        sinon.assert.notCalled(spy);
        stub2.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
        spy.restore();
        done();
      });
  });
});

describe('Test processNewPendingTxArray function', () => {
  test('Should call processTx.newPendingTx twice', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = [web3.transactions[0], web3.transactions[1]];
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };

    const stub1 = sinon.stub(processTx, 'newPendingTx');
    stub1.resolves();
    return processTx.processNewPendingTxArray(web3, tx, dbCollections, abiDecoder)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        stub1.restore();
        done();
      });
  });
});

describe('Test checkTokenTransferEvent function', () => {
  test('When transfer event IS NOT a regular token transfer (asset=ETH) and recipient is a pillar address, checkTokenTransferEvent should call processTx.filterAddress once, dbCollections.ethTransactions.findByTxHash once, dbCollections.ethAddresses.getFCMIID once and notif.sendNotification once', (done) => {
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    let web3;
    const bcx = require('./bcx.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    const dbCollections = { ethTransactions, ethAddresses };
    const notif = require('./notifications.js');
    const eventInfo = {
      value: 1000000000000000000,
      transactionHash: 'txHash',
      returnValues: {
        _to: 'toAddress',
        _from: 'fromAddress',
        _value: 999,
      },
    };
    const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };
    const stub3 = sinon.stub(dbCollections.ethTransactions, 'findByTxHash');
    stub3.resolves({
      tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'ETH',
    });
    const stub4 = sinon.stub(dbCollections.ethAddresses, 'getFCMIID');
    stub4.resolves('FCMIID');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();

    return processTx.checkTokenTransferEvent(web3, bcx, dbCollections, notif, eventInfo, ERC20SmartcContractInfo)
      .then(() => {
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub3);
        sinon.assert.calledOnce(stub4);
        sinon.assert.calledOnce(stub5);
        stub1.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
        done();
      });
  });

  test('When transfer event IS regular token transfer (asset!=ETH), checkTokenTransferEvent should call processTx.filterAddress once,  call dbCollections.ethTransactions.findByTxHash once,  NOT call dbCollections.ethAddresses.getFCMIID  and  NOT call notif.sendNotification', (done) => {
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    let web3;
    const bcx = require('./bcx.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    const dbCollections = { ethTransactions, ethAddresses };
    const notif = require('./notifications.js');
    const eventInfo = {
      value: 1000000000000000000,
      transactionHash: 'txHash',
      returnValues: {
        _to: 'toAddress',
        _from: 'fromAddress',
        _value: 999,
      },
    };
    const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };
    const stub3 = sinon.stub(dbCollections.ethTransactions, 'findByTxHash');
    stub3.resolves({
      tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'PLR',
    });
    const stub4 = sinon.stub(dbCollections.ethAddresses, 'getFCMIID');
    stub4.resolves('FCMIID');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();

    return processTx.checkTokenTransferEvent(web3, bcx, dbCollections, notif, eventInfo, ERC20SmartcContractInfo)
      .then(() => {
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub3);
        sinon.assert.notCalled(stub4);
        sinon.assert.notCalled(stub5);
        stub1.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
        done();
      });
  });

  test('When recipient is not a pillar address, checkTokenTransferEvent should call processTx.filterAddress once, NOT call dbCollections.ethTransactions.findByTxHash,  NOT call dbCollections.ethAddresses.getFCMIID  and  NOT call notif.sendNotification', (done) => {
    const stub1 = sinon.stub(processTx, 'filterAddress');
    stub1.resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    let web3;
    const bcx = require('./bcx.js');
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    jest.mock('../controllers/ethAddresses_ctrl.js');
    const ethAddresses = require('../controllers/ethAddresses_ctrl.js');
    const dbCollections = { ethTransactions, ethAddresses };
    const notif = require('./notifications.js');
    const eventInfo = {
      value: 1000000000000000000,
      transactionHash: 'txHash',
      returnValues: {
        _to: 'toAddress',
        _from: 'fromAddress',
        _value: 999,
      },
    };
    const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };
    const stub3 = sinon.stub(dbCollections.ethTransactions, 'findByTxHash');
    stub3.resolves({
      tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'PLR',
    });
    const stub4 = sinon.stub(dbCollections.ethAddresses, 'getFCMIID');
    stub4.resolves('FCMIID');
    const stub5 = sinon.stub(notif, 'sendNotification');
    stub5.resolves();

    return processTx.checkTokenTransferEvent(web3, bcx, dbCollections, notif, eventInfo, ERC20SmartcContractInfo)
      .then(() => {
        sinon.assert.calledOnce(stub1);
        sinon.assert.notCalled(stub3);
        sinon.assert.notCalled(stub4);
        sinon.assert.notCalled(stub5);
        stub1.restore();
        stub3.restore();
        stub4.restore();
        stub5.restore();
        done();
      });
  });
});
