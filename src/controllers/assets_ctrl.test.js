afterAll(() => {
	jest.restoreAllMocks();
});
describe('Test assets_ctrl', () => {
	test('listAll function should call assetsModel.SmartContracts.find once and return mocked list of assets', (done) => {
		jest.mock('../models/assets_model.js');
		const assetsCtrl = require('./assets_ctrl.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = jest.spyOn(assetsModel.Assets, 'find');
		return assetsCtrl.listAll()
		.then((result) => {
			expect(result).toMatch('list of assets');
			expect(spy).toHaveBeenCalled();

			done();
		});
	});

	test('emptyCollection function should call assetsModel.Assets.remove once', () => {
		jest.mock('../models/assets_model.js');
		const assetsCtrl = require('./assets_ctrl.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = jest.spyOn(assetsModel.Assets, 'remove');
		assetsCtrl.emptyCollection();
		expect(spy).toHaveBeenCalled();
	});

	test('findByTicker function should call assetsModel.Assets.findOne once and return mocked asset', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = jest.spyOn(assetsModel.Assets, 'findOne');
		return assetsCtrl.findByTicker('BOKKY')
		.then((result) => {
			expect(result).toMatch('BOKKYasset');
			expect(spy).toHaveBeenCalled();

			done();
		});
	});

	test('findByAddress function should call assetsModel.Assets.findOne once', (done) => {
		const assetsCtrl = require('./assets_ctrl.js');
		jest.mock('../models/assets_model.js');
		const assetsModel = require('../models/assets_model.js');
		const spy = jest.spyOn(assetsModel.Assets, 'findOne');
		return assetsCtrl.findByAddress('address')
		.then(() => {
			expect(spy).toHaveBeenCalled();

			done();
		});
	});
});
