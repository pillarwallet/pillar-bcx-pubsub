
afterAll(() => {
	jest.restoreAllMocks();
});

describe('Test transactions_ctrl functions', () => {
	test('listAll function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		jest.mock('../models/transactions_model.js');
		const transactionsCtrl = require('./transactions_ctrl.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		transactionsCtrl.listAll().then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			expect(spy).toHaveBeenCalled();
			done();
		});
	});

	 test('listPending function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
	 	jest.mock('../models/transactions_model.js');
	 	const transactionsCtrl = require('./transactions_ctrl.js');
	 	const transactionsModel = require('../models/transactions_model.js');
	 	const spy = jest.spyOn(transactionsModel.Transactions, 'find');
	 	return transactionsCtrl.listPending("Ethereum")
	 	.then((result) => {
	 		expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
	 		expect(spy).toHaveBeenCalled();
	 		done();
	 	});
	 });

	 test('listHistory function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
	 	const transactionsCtrl = require('./transactions_ctrl.js');
	 	jest.mock('../models/transactions_model.js');
	 	const transactionsModel = require('../models/transactions_model.js');
	 	const spy = jest.spyOn(transactionsModel.Transactions, 'find');
	 	return transactionsCtrl.listPending("Ethereum")
	 	.then((result) => {
			  expect(result).toEqual([{ "_id": "pillarId", "protocol": "Ethereum", "txHash": "hash" }]);
	 		expect(spy).toHaveBeenCalled();
	 		done();
	 	});
	 });

	test('listDbZeroConfTx function should call transactionsModel.Transactions.find once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		return transactionsCtrl.listDbZeroConfTx()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			expect(spy).toHaveBeenCalled();
			done();
		});
	});

	test('findById function should call transactionsModel.Transactions.findOne once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'findOne');
		return transactionsCtrl.findById()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			expect(spy).toHaveBeenCalled();
			done();
		});
	});

	test('findByTxHash function should call transactionsModel.Transactions.findOne once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		return transactionsCtrl.findByTxHash()
		.then((result) => {
			expect(result).toEqual([{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
			expect(spy).toHaveBeenCalled();
			done();
		});
	});


	test('findOneByTxHash function should call transactionsModel.Transactions.findOne once and return mocked list of transactions', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'findOne');
		return transactionsCtrl.findOneByTxHash()
			.then((result) => {
				expect(result).toEqual([{ _id: "pillarId", txHash: "hash", protocol: "Ethereum" }]);
				expect(spy).toHaveBeenCalled();
				done();
			});
	});

	
	 test("addTx function should call save()", (done) => {
	 	let transactionsCtrl = require('./transactions_ctrl.js');
	 	jest.mock('../models/transactions_model.js')
	 	let transactionsModel = require('../models/transactions_model.js')
	 	return transactionsCtrl.addTx({})
	 	.then(function(result){
	 			done()
	 	});
	 });	




	test('updateTx function should call transactionsModel.Transactions.update once', (done) => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'update');
		return transactionsCtrl.updateTx({txHash: "hash", status: "confirmed"})
		.then(() => {
			expect(spy).toHaveBeenCalled();
			done()
		})
	});

	test('txFailed function should call  transactionsModel.Transactions.update once', () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'update');
		transactionsCtrl.txFailed();
		expect(spy).toHaveBeenCalled()
	});

	test('emptyCollection function should call transactionsModel.Transactions.remove', () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'remove');
		transactionsCtrl.emptyCollection();
		expect(spy).toHaveBeenCalled()
	});

	test('findMaxBlock function', done => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const TransactionsFindMock = jest.spyOn(transactionsModel.Transactions, "find");
		const TransactionsFindDistinctResult = jest.fn(() => {
			return {
				limit: jest.fn(() => {
					return  new Promise((resolve, reject) => {
						resolve({ blockNumber: 1})
					}) }) } });
		const countDocuments = jest.fn(() => {
			return 0
		})
		const TransactionsFindResult = {
			sort: TransactionsFindDistinctResult,
			countDocuments: countDocuments
		};
		const TransactionsFind = jest.fn(() => TransactionsFindResult);
		TransactionsFindMock.mockImplementation(TransactionsFind);
		transactionsCtrl.findMaxBlock().then((result) => {
			done()
		});
	})


	test('getBalance function', done => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const TransactionsAggregateMock = jest.spyOn(transactionsModel.Transactions, "aggregate");
		transactionsCtrl.getBalance("address", "asset").then((result) => {
			expect(result).toEqual(0)
			expect(TransactionsAggregateMock).toHaveBeenCalled()
			done()
			
		});
	})




	test("getTxHistory('address1', 'address2', 'ALL', 0) should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'address2', 'ALL', 0);
		expect(spy).toHaveBeenCalled()
	});


	test("getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL') should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'address2', 'ALL');
		expect(spy).toHaveBeenCalled()
	});

	test("getTxHistory('address1', 'fromtmstmp', 'All', 'asset') function should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'asset');
		expect(spy).toHaveBeenCalled()
	});

	test("getTxHistory('address1', 'fromtmstmp', 'All', 'ALL') function should call transactionsModel.Transactions.find twice'", () => {
		const transactionsCtrl = require('./transactions_ctrl.js');
		jest.mock('../models/transactions_model.js');
		const transactionsModel = require('../models/transactions_model.js');
		const spy = jest.spyOn(transactionsModel.Transactions, 'find');
		transactionsCtrl.getTxHistory('address1', 'fromtmstmp', 'All', 'ALL');
		expect(spy).toHaveBeenCalled()
	});
});
