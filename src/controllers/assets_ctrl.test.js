const sinon = require('sinon');

describe('Test smartContracts_ctrl', () => {
  test('listAll function should call smartContractsModel.SmartContracts.find once and return mocked list of smart contracts', (done) => {
    jest.mock('../models/smartContracts_model.js');
    const smartContractsCtrl = require('./assets_ctrl.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'find');
    return smartContractsCtrl.listAll()
      .then((result) => {
        expect(result).toMatch('list of smacos');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('emptyCollection function should call smartContractsModel.SmartContracts.remove once', () => {
    jest.mock('../models/smartContracts_model.js');
    const smartContractsCtrl = require('./assets_ctrl.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'remove');
    smartContractsCtrl.emptyCollection();
    sinon.assert.calledOnce(spy);
    spy.restore();
  });

  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
    test("addContract function should call smartContracts.update once and return 'list of addresses'", () => {
        let dbServices=require('../services/dbServices.js')
        let url='mongodb://127.0.0.1:27017/PillarBCX'
        jest.mock('mongoose')
        var mongoose = require('mongoose');
        dbServices.dbConnect(url)
        .then(function(){
            //console.log('ok')
            let smartContracts = require('./assets_ctrl.js');
            jest.mock('../models/smartContracts_model.js')
            let smartContractsModel=require('../models/smartContracts_model.js')
            console.log('loaded')
            let spy=sinon.spy(smartContractsModel.smartContracts,"save")
            //let spy2=sinon.spy(ethTransactions,"findById")
            //stub1.returns('listOfETHAddresses')
            return smartContracts.addContract()

                //expect(result).toMatch("list of tx")
                sinon.assert.calledOnce(spy)
                spy.restore()

        })
    });
    */

  test('findByTicker function should call smartContractsModel.SmartContracts.findOne once and return mocked smart contract', (done) => {
    const smartContractsCtrl = require('./assets_ctrl.js');
    jest.mock('../models/smartContracts_model.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'findOne');
    return smartContractsCtrl.findByTicker('BOKKY')
      .then((result) => {
        expect(result).toMatch('BOKKYsmaco');
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findByAddress function should call smartContractsModel.SmartContracts.findOne once', (done) => {
    const smartContractsCtrl = require('./assets_ctrl.js');
    jest.mock('../models/smartContracts_model.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'findOne');
    return smartContractsCtrl.findByAddress('address')
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
  // ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
  /*
    test("addZeroSmartContractsCreationHistoryHeight function should call smartContracts.save once", (done) => {

        let smartContractsCtrl = require('./assets_ctrl.js');
        jest.mock('../models/smartContracts_model.js')
        let smartContractsModel=require('../models/smartContracts_model.js')
        let spy=sinon.spy(smartContractsModel.smartContracts,"save")
        return smartContractsCtrl.addZeroSmartContractsCreationHistoryHeight()
        .then(function(result){
            sinon.assert.calledOnce(spy)
            spy.restore()
            done()
        })

    });
*/
  test('updateERC20SmartContractsHistoryHeight function should call smartContractsModel.SmartContracts.update once', (done) => {
    const smartContractsCtrl = require('./assets_ctrl.js');
    jest.mock('../models/smartContracts_model.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'update');
    return smartContractsCtrl.updateERC20SmartContractsHistoryHeight()
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });

  test('findERC20SmartContractsHistoryHeight function should call smartContractsModel.SmartContracts.find once', (done) => {
    const smartContractsCtrl = require('./assets_ctrl.js');
    jest.mock('../models/smartContracts_model.js');
    const smartContractsModel = require('../models/smartContracts_model.js');
    const spy = sinon.spy(smartContractsModel.SmartContracts, 'find');
    return smartContractsCtrl.findERC20SmartContractsHistoryHeight()
      .then(() => {
        sinon.assert.calledOnce(spy);
        spy.restore();
        done();
      });
  });
});
