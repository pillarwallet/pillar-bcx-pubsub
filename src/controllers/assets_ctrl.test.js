/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
