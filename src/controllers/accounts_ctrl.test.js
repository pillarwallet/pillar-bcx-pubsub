const sinon = require('sinon');

describe('Test accounts.listAll function', () => {
  test("listAll function should call accounts.find once and return [{'FCMIID': 'FCMIID', 'address': 'address'}]", (done) => {
    jest.mock('../models/accounts_model.js');
    const accountsCtrl = require('./accounts_ctrl.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'find');
    return accountsCtrl.listAll()
      .then((result) => {
        expect(result).toEqual([{ FCMIID: 'FCMIID', address: 'address' }]);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
    // })
  });

  test('findByAddress function should call accounts.findOne once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'findOne');
    return accountsCtrl.findByAddress('address')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findByWalletId function should call accounts.findOne once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'findOne');
    return accountsCtrl.findByWalletId('pillarId')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });


  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
describe('Test accounts.addAddress function', () => {
    test("add function should create an accounts.ethAdresses instance once and save it", (done) => {
        let dbServices=require('../services/dbServices.js')
        let url='mongodb://127.0.0.1:27017/PillarBCX'
        jest.mock('mongoose')
        var mongoose = require('mongoose');
        return dbServices.dbConnect(url)
        .then(function(){
            let accounts = require('./accounts_ctrl.js');
            jest.mock('../models/accounts_model.js')
            let accountsModel=require('../models/accounts_model.js')
            let spy=sinon.spy(accountsModel,"accounts")// DID NOT MANAGE TO SPY ON CONSTRUCTOR INSTANCE
            //stub1.returns('listOfaccounts')
            let address='address'
            accounts.addAddress(address)
            //.then(function(){
                sinon.assert.calledOnce(spy)
                spy.restore()
                done()
           //})
        })
    });
});
*/

  test('getFCMIID function should call accounts.find once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'find');
    return accountsCtrl.getFCMIID('publicAddress')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('emptyCollection function should call accounts.remove once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'remove');
    return accountsCtrl.emptyCollection()
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('updateFCMIID function should call accounts.update once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'update');
    return accountsCtrl.updateFCMIID('pillarId', 'publicAddress', 'newFCMIID')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('removeAddress function should call accounts.remove once', (done) => {
    const accountsCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const accountsModel = require('../models/accounts_model.js');
    const spy = sinon.spy(accountsModel.accounts, 'remove');
    return accountsCtrl.removeAddress('pillarId')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
});

