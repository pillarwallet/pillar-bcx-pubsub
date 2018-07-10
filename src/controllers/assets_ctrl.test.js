const sinon = require('sinon');

describe('Test assets_ctrl', () => {
	test('listAll function should call assetsModel.SmartContracts.find once and return mocked list of assets', (done) => {
		jest.mock('../models/assets_model.js');
		const assetsCtrl = require('./assets_ctrl.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'find');
		return assetsCtrl.listAll()
		.then((result) => {
			expect(result).toMatch('list of assets');
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('emptyCollection function should call assetsModel.Assets.remove once', () => {
		jest.mock('../models/assets_model.js');
		const assetsCtrl = require('./assets_ctrl.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'remove');
		assetsCtrl.emptyCollection();
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
						jest.mock('../models/assets_model.js')
						let smartContractsModel=require('../models/assets_model.js')
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

	test('findByTicker function should call assetsModel.Assets.findOne once and return mocked asset', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'findOne');
		return assetsCtrl.findByTicker('BOKKY')
		.then((result) => {
			expect(result).toMatch('BOKKYasset');
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('findByAddress function should call assetsModel.Assets.findOne once', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'findOne');
		return assetsCtrl.findByAddress('address')
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
				jest.mock('../models/assets_model.js')
				let smartContractsModel=require('../models/assets_model.js')
				let spy=sinon.spy(smartContractsModel.smartContracts,"save")
				return smartContractsCtrl.addZeroSmartContractsCreationHistoryHeight()
				.then(function(result){
						sinon.assert.calledOnce(spy)
						spy.restore()
						done()
				})

		});
*/
	test('updateERC20SmartContractsHistoryHeight function should call assetsModel.Assets.update once', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'update');
		return assetsCtrl.updateERC20SmartContractsHistoryHeight()
		.then(() => {
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

	test('findERC20SmartContractsHistoryHeight function should call assetsModel.Assets.find once', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = sinon.spy(assetsModel.Assets, 'find');
		return assetsCtrl.findERC20SmartContractsHistoryHeight()
		.then(() => {
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});
});
