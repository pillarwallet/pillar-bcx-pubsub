const sinon = require('sinon');

describe('Test transactions_ctrl functions', () => {
	test('listAll function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		jest.mock('../models/transactions_model.js');
		const transactionsCtrl = require('./transactions_ctrl.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listAll()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('listPending function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listPending()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('listHistory function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listPending()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('listDbZeroConfTx function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listDbZeroConfTx()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('findById function should call transactionsModel.Transactions.findOne once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'findOne');
		return transactionsCtrl.findById()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('findByTxHash function should call transactionsModel.Transactions.findOne once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.findByTxHash()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
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
						let ethTransactions = require('./transactions_ctrl.js');
						jest.mock('../models/transactions_model.js')
						let ethTransactionsModel=require('../models/transactions_model.js')

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

	test('updateTx function should call transactionsModel.Transactions.update once', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'update');
		return transactionsCtrl.updateTx({txHash: "hash", status: "confirmed"})
		.then(() => {
			sinon.assert.calledOnce(spy);
			spy.restore();
			done()
		})
	});

	test('txFailed function should call  transactionsModel.Transactions.update once', () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'update');
		transactionsCtrl.txFailed();
		sinon.assert.calledOnce(spy);
		spy.restore();
	});

	test('emptyCollection function should call transactionsModel.Transactions.remove', () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'remove');
		transactionsCtrl.emptyCollection();
		sinon.assert.calledOnce(spy);
		spy.restore();
	});
	// ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
	/*
		test("addZeroTxHistoryHeight function '", () => {

		 });
	*/
	test('updateTxHistoryHeight function should call transactionsModel.Transactions.update once', () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'update');
		transactionsCtrl.updateTxHistoryHeight(12345);
		sinon.assert.calledOnce(spy);
		spy.restore();
	});

	test("findTxHistoryHeight function should call transactionsModel.Transactions.find once'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		transactionsCtrl.findTxHistoryHeight();
		sinon.assert.calledOnce(spy);
		spy.restore();
	});

	test("getTxHistory('address1', 'address2', 'ALL', 0) should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'address2', 'ALL', 0);
		sinon.assert.calledTwice(spy);
		spy.restore();
	});


	test("getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL') should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL');
		sinon.assert.calledTwice(spy);
		spy.restore();
	});

	test("getTxHistory('address1', 'fromtmstmp', 'All', 'asset') function should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'asset');
		sinon.assert.calledTwice(spy);
		spy.restore();
	});

	test("getTxHistory('address1', 'fromtmstmp', 'All', 'ALL') function should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'ALL');
		sinon.assert.calledTwice(spy);
		spy.restore();
	});
});
