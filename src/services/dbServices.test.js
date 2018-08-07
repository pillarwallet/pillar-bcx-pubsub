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

