const sinon = require('sinon');

describe('Test ethAddresses.listAll function', () => {
  test("listAll function should call ethAddresses.find once and return [{'FCMIID': 'FCMIID', 'address': 'address'}]", (done) => {
    jest.mock('../models/accounts_model.js');
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'find');
    return ethAddressesCtrl.listAll()
      .then((result) => {
        expect(result).toEqual([{ FCMIID: 'FCMIID', address: 'address' }]);
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
    // })
  });

  test('findByAddress function should call ethAddresses.findOne once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'findOne');
    return ethAddressesCtrl.findByAddress('address')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findByWalletId function should call ethAddresses.findOne once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'findOne');
    return ethAddressesCtrl.findByWalletId('walletId')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });


  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
describe('Test ethAddresses.addAddress function', () => {
    test("add function should create an ethAddresses.ethAdresses instance once and save it", (done) => {
        let dbServices=require('../pubServices/dbServices.js')
        let url='mongodb://127.0.0.1:27017/PillarBCX'
        jest.mock('mongoose')
        var mongoose = require('mongoose');
        return dbServices.dbConnect(url)
        .then(function(){
            let ethAddresses = require('./accounts_ctrl.js');
            jest.mock('../models/accounts_model.js')
            let ethAddressesModel=require('../models/accounts_model.js')
            let spy=sinon.spy(ethAddressesModel,"ethAddresses")// DID NOT MANAGE TO SPY ON CONSTRUCTOR INSTANCE
            //stub1.returns('listOfETHAddresses')
            let address='address'
            ethAddresses.addAddress(address)
            //.then(function(){
                sinon.assert.calledOnce(spy)
                spy.restore()
                done()
           //})
        })
    });
});
*/

  test('getFCMIID function should call ethAddresses.find once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'find');
    return ethAddressesCtrl.getFCMIID('publicAddress')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('emptyCollection function should call ethAddresses.remove once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'remove');
    return ethAddressesCtrl.emptyCollection()
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('updateFCMIID function should call ethAddresses.update once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'update');
    return ethAddressesCtrl.updateFCMIID('walletID', 'publicAddress', 'newFCMIID')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('removeAddress function should call ethAddresses.remove once', (done) => {
    const ethAddressesCtrl = require('./accounts_ctrl.js');
    jest.mock('../models/accounts_model.js');
    const ethAddressesModel = require('../models/accounts_model.js');
    const spy = sinon.spy(ethAddressesModel.EthAddresses, 'remove');
    return ethAddressesCtrl.removeAddress('walletID')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
});

