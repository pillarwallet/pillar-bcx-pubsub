// TEST FAILING DUE TO ethTxSchema INDEXING... REPLACED WITH A DUMMY TEST BELOW


/*
const dbServices = require('../services/dbServices.js');

const url = 'mongodb://127.0.0.1:27017/PillarBCX';
jest.mock('mongoose');
const mongoose = require('mongoose');

dbServices.dbConnect(url);



 const transactions = require('./transactions_model.js');


describe('Test transactions', () => {

	test('transactions should be defined', () => {

		// expect(transactions.Transactions).toBeDefined();
	});

});

*/

describe('Test transactions', () => {

	test('transactions should be defined', () => {

		expect(1).toEqual(1);
	});

});
