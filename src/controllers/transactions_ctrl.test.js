const sinon = require('sinon');

describe('Test ethTransactions_ctrl functions', () => {
  test('listAll function should call ethTransactionsModel.EthTransactions.find once and return mocked list of transactions', (done) => {
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    return ethTransactionsCtrl.listAll()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('listPending function should call ethTransactionsModel.EthTransactions.find once and return mocked list of transactions', (done) => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    return ethTransactionsCtrl.listPending()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('listHistory function should call ethTransactionsModel.EthTransactions.find once and return mocked list of transactions', (done) => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    return ethTransactionsCtrl.listPending()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('listDbZeroConfTx function should call ethTransactionsModel.EthTransactions.find once and return mocked list of transactions', (done) => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    return ethTransactionsCtrl.listDbZeroConfTx()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findById function should call ethTransactionsModel.EthTransactions.findOne once and return mocked list of transactions', (done) => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'findOne');
    return ethTransactionsCtrl.findById()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findByTxHash function should call ethTransactionsModel.EthTransactions.findOne once and return mocked list of transactions', (done) => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'findOne');
    return ethTransactionsCtrl.findByTxHash()
      .then((result) => {
        expect(result).toMatch('list of tx');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
    test("addTx function ", (done) => {
        let dbServices=require('../services/dbServices.js')
        let url='mongodb://127.0.0.1:27017/PillarBCX'
        jest.mock('mongoose')
        var mongoose = require('mongoose');
        dbServices.dbConnect(url)
        .then(function(){
            //console.log('ok')
            let ethTransactions = require('./ethTransactions_ctrl.js');
            jest.mock('../models/ethTransactions_model.js')
            let ethTransactionsModel=require('../models/ethTransactions_model.js')

            let spy=sinon.spy(ethTransactionsModel,"findOne")
            //stub1.returns('listOfETHAddresses')
            return ethTransactions.findById()
            .then(function(result){
                expect(result).toMatch("list of tx")
                sinon.assert.calledOnce(spy)
                spy.restore()
                done()
            })
        })
    });

    */

  test('updateTx function should call ethTransactionsModel.EthTransactions.update once', () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
	  const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'update');
    ethTransactionsCtrl.updateTx();
	  sinon.assert.calledOnce(spy);
	  spy.restore();
  });

  test('txFailed function should call ethTransactionsModel.EthTransactions.update once', () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'update');
    ethTransactionsCtrl.txFailed();
    sinon.assert.calledOnce(spy);
    spy.restore();
  });

  test('emptyCollection function should call ethTransactionsModel.EthTransactions.remove', () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'remove');
    ethTransactionsCtrl.emptyCollection();
    sinon.assert.calledOnce(spy);
    spy.restore();
  });
  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
    test("addZeroTxHistoryHeight function '", () => {

     });
  */
  test('updateTxHistoryHeight function should call ethTransactionsModel.EthTransactions.update once', () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'update');
    ethTransactionsCtrl.updateTxHistoryHeight(12345);
    sinon.assert.calledOnce(spy);
    spy.restore();
  });

  test("findTxHistoryHeight function should call ethTransactionsModel.EthTransactions.find once'", () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    ethTransactionsCtrl.findTxHistoryHeight();
    sinon.assert.calledOnce(spy);
    spy.restore();
  });

  test("getTxHistory('address1', 'address2', 'ALL', 0) should call ethTransactionsModel.EthTransactions.find twice'", () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    ethTransactionsCtrl.getTxHistory('address1', 'address2', 'ALL', 0);
    sinon.assert.calledTwice(spy);
    spy.restore();
  });


  test("getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL') should call ethTransactionsModel.EthTransactions.find twice'", () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    ethTransactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL');
    sinon.assert.calledTwice(spy);
    spy.restore();
  });

  test("getTxHistory('address1', 'fromtmstmp', 'All', 'asset') function should call ethTransactionsModel.EthTransactions.find twice'", () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    ethTransactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'asset');
    sinon.assert.calledTwice(spy);
    spy.restore();
  });

  test("getTxHistory('address1', 'fromtmstmp', 'All', 'ALL') function should call ethTransactionsModel.EthTransactions.find twice'", () => {
    const ethTransactionsCtrl = require('./ethTransactions_ctrl.js');
    jest.mock('../models/ethTransactions_model.js');
    const ethTransactionsModel = require('../models/ethTransactions_model.js');
    const spy = sinon.spy(ethTransactionsModel.EthTransactions, 'find');
    ethTransactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'ALL');
    sinon.assert.calledTwice(spy);
    spy.restore();
  });
});

