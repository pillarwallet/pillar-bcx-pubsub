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
});
