const sinon = require('sinon');
const bcx = require('./bcx');


describe('Test getTxInfo function', () => {
  test('Should call getTransaction once and return mocked tx object', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const spy = sinon.spy(web3.eth, 'getTransaction');
    return bcx.getTxInfo(web3, web3.txHash)
      .then((result) => {
        sinon.assert.calledOnce(spy);
        expect(result).toEqual(web3.txObject);
        spy.restore();
        done();
      });
  });
});

describe('Test getBlockTx function', () => {
  test('Should call getBlock once and return mocked transactions object', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const spy = sinon.spy(web3.eth, 'getBlock');
    return bcx.getBlockTx(web3, web3.blockNumber)
      .then((result) => {
        sinon.assert.calledOnce(spy);
        expect(result).toEqual(web3.transactions);
        spy.restore();
        done();
      });
  });
});

describe('Test getBlockNumber function', () => {
  test('Should call web3.eth.getBlock once and return mocked block number', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const spy = sinon.spy(web3.eth, 'getBlock');
    return bcx.getBlockNumber(web3, web3.blockHash)
      .then((result) => {
        sinon.assert.calledOnce(spy);
        expect(result).toEqual(web3.blockNumber);
        spy.restore();
        done();
      });
  });
});

describe('Test getLastBlockNumber function', () => {
  test('Should call web3.eth.getBlockNumber once and return mocked block number', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const spy = sinon.spy(web3.eth, 'getBlockNumber');
    return bcx.getLastBlockNumber(web3)
      .then((result) => {
        expect(result).toEqual(web3.blockNumber);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
});

describe('Test getTxReceipt function', () => {
  test('Should call web3.eth.getTransactionReceipt once and return mocked txReceipt object', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const spy = sinon.spy(web3.eth, 'getTransactionReceipt');
    // console.log(web3)
    return bcx.getTxReceipt(web3, web3.txHash)
      .then((result) => {
        expect(result).toEqual(web3.txReceipt);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('Promise should reject when wrong transaction hash is passed', () => {
    jest.mock('web3');
    const web3 = require('web3');
    return expect(bcx.getTxReceipt(web3, 'notATxHash')).rejects.toThrowError('Not A Tx Hash');
  });
});

describe('Test getPendingTxArray function', () => {
  test('Should call web3.eth.getBlock once and return mocked transactions array', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const stub = sinon.stub(web3.eth, 'getBlock');
    stub.resolves({ transactions: web3.poolTransactions });
    // console.log(web3)
    return bcx.getPendingTxArray(web3, web3.txHash)
      .then((result) => {
        expect(result).toEqual(web3.poolTransactions);
        sinon.assert.calledOnce(stub);
        stub.restore();
        done();
      });
  });
});

describe('Test getBalance function', () => {
  test('getBalance call for ETH should call web3.eth.getBalance once, web3.utils.fromWei once and web3.utils.toBN once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const stub1 = sinon.stub(web3.eth, 'getBalance');
    stub1.resolves(100000000000000000);
    const stub2 = sinon.stub(web3.utils, 'fromWei');
    stub2.resolves(1);
    const stub3 = sinon.stub(web3.utils, 'toBN');
    stub3.resolves(100000000000000000);

    return bcx.getBalance('0xaddress', 'ETH', web3)
      .then((result) => {
        expect(result).toEqual(1);
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub2);
        sinon.assert.calledOnce(stub3);
        stub1.restore();
        stub2.restore();
        stub3.restore();
        done();
      });
  });

  test('getBalance call for ERC20 token should call smartContracts.findByTicker once, web3.eth.call once , web3.utils.fromWei once and web3.utils.toBN once', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('../controllers/smartContracts_ctrl.js');
    const spy2 = sinon.spy(web3.eth, 'call');
    // stub1.resolves(100000000000000000)
    const stub1 = sinon.stub(web3.utils, 'fromWei');
    stub1.resolves(1);
    const stub2 = sinon.stub(web3.utils, 'toBN');
    stub2.resolves(100000000000000000);

    return bcx.getBalance('0xaddress', 'BOKKY', web3, '0xSmartContractAddress')
      .then((result) => {
        expect(result).toEqual(1);
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub2);
        // sinon.assert.calledOnce(spy1)
        sinon.assert.calledOnce(spy2);
        stub1.restore();
        stub2.restore();
        // spy1.restore()
        spy2.restore();
        done();
      });
  });
});

describe('Test getBlockSmartContractsAddressesArray function', () => {
  test('Should call web3.eth.getTransactionReceipt twice and return mocked smart contracts addresses array', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    const stub = sinon.stub(web3.eth, 'getTransactionReceipt');
    stub.resolves({ contractAddress: 'contractAddress' });

    const txHashArray = ['txHash1', 'txHash2'];
    console.log(txHashArray);
    return bcx.getBlockSmartContractsAddressesArray(web3, txHashArray, [], 0)
      .then((result) => {
        sinon.assert.calledTwice(stub);
        expect(result).toEqual(['contractAddress', 'contractAddress']);
        stub.restore();
        done();
      });
  });
});
