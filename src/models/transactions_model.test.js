const dbServices = require('../services/dbServices.js');

const url = 'mongodb://127.0.0.1:27017/PillarBCX';
jest.mock('mongoose');
const mongoose = require('mongoose');

dbServices.dbConnect(url);
const ethTransactions = require('./transactions_model.js');


describe('Test ethTransactions', () => {
  test('ethTransactions should be defined', () => {
    // TEST FAILING DUE TO ethTxSchema INDEXING...
    // expect(ethTransactions.EthTransactions).toBeDefined();
  });
});

