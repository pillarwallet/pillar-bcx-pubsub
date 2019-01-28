/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const sinon = require('sinon');

describe('Test transactions_ctrl functions', () => {
	test('listAll function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		jest.mock('../models/transactions_model.js');
		const transactionsCtrl = require('./transactions_ctrl.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listAll()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	// test('listPending function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
	// 	jest.mock('../models/transactions_model.js');
	// 	const transactionsCtrl = require('./transactions_ctrl.js');
	// 	const transactionsModel = require('../models/transactions_model.js');
	// 	const spy = sinon.spy(transactionsModel.Transactions, 'find');
	// 	return transactionsCtrl.listPending("Ethereum")
	// 	.then((result) => {
	// 		expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
	// 		sinon.assert.calledOnce(spy);
	// 		spy.restore();
	// 		done();
	// 	});
	// });

	// test('listHistory function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
	// 	const transactionsCtrl = require('./transactions_ctrl.js');
	// 	jest.mock('../models/transactions_model.js');
	// 	const transactionsModel = require('../models/transactions_model.js');
	// 	const spy = sinon.spy(transactionsModel.Transactions, 'find');
	// 	return transactionsCtrl.listPending("Ethereum")
	// 	.then((result) => {
	// 		expect(result).toEqual([{_id: "pillarId", txHash: "hash"}]);
	// 		sinon.assert.calledOnce(spy);
	// 		spy.restore();
	// 		done();
	// 	});
	// });

	test('listDbZeroConfTx function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = sinon.spy(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listDbZeroConfTx()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
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
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
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
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});
	
	// test("addTx function should call save()", (done) => {
	// 	let transactionsCtrl = require('./transactions_ctrl.js');
	// 	jest.mock('../models/transactions_model.js')
	// 	let transactionsModel = require('../models/transactions_model.js')
	// 	let spy=sinon.spy(transactionsModel.Transactions, 'save')
	// 	return transactionsCtrl.addTx({})
	// 	.then(function(result){
	// 			sinon.assert.calledOnce(spy)
	// 			spy.restore()
	// 			done()
	// 	});
	// });	

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
