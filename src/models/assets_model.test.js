const dbServices = require('../subServices/dbServices.js');

const url = 'mongodb://127.0.0.1:27017/PillarBCX';
jest.mock('mongoose');
const mongoose = require('mongoose');

dbServices.dbConnect(url);
const smartContracts = require('./assets_model.js');

describe('Test smartContracts', () => {
  test('SmartContracts should be defined', (done) => {
    expect(smartContracts.SmartContracts).toBeDefined();
    done();
  });
});
