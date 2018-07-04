const dbServices = require('../services/dbServices.js');

const url = 'mongodb://127.0.0.1:27017/PillarBCX';
jest.mock('mongoose');
const mongoose = require('mongoose');

dbServices.dbConnect(url);

const ethAddresses = require('./accounts_model.js');

describe('Test ethAddresses', () => {
  test('ethAddresses should be defined', () => {
    expect(ethAddresses.EthAddresses).toBeDefined();
  });
});
