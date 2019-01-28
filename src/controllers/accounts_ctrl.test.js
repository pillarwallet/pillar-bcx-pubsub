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
afterAll(() => {
	jest.restoreAllMocks();
});

describe('Test accounts.listAll function', () => {
	test("listAll function should call accounts.find once and return [{'address': 'address'}]", (done) => {
		jest.mock('../models/accounts_model.js');
		const accountsCtrl = require('./accounts_ctrl.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'find');
		return accountsCtrl.listAll()
		.then((result) => {
			expect(result).toEqual([{ address: 'address' }]);
			expect(spy).toHaveBeenCalled();
			done();
		});
	});

	test("listRecent function should call accounts.find once and return [{'address': 'address'}]", (done) => {
		jest.mock("mongoose")
		jest.mock('../models/accounts_model.js');
		const accountsCtrl = require('./accounts_ctrl.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'find');
		return accountsCtrl.listRecent()
			.then((result) => {
				expect(result).toEqual([{ address: 'address' }]);
				expect(spy).toHaveBeenCalled();
				done();
			});
	});

	test('findByAddress function should call accounts.findOne once', (done) => {
		const accountsCtrl = require('./accounts_ctrl.js');
		jest.mock('../models/accounts_model.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'findOne');
		return accountsCtrl.findByAddress('address', 'Ethereum')
		.then(() => {
			expect(spy).toHaveBeenCalled();
			done();
		});
	});

	test('findByWalletId function should call accounts.findOne once', (done) => {
		const accountsCtrl = require('./accounts_ctrl.js');
		jest.mock('../models/accounts_model.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'findOne');
		return accountsCtrl.findByWalletId('walletId')
		.then(() => {
			expect(spy).toHaveBeenCalled();
			done();
		});
	});



describe('Test ethAddresses.addAddress function', () => {
		test("add function should create an ethAddresses.ethAdresses instance once and save it", (done) => {
			let ethAddresses = require('./accounts_ctrl.js');
			jest.mock('../models/accounts_model.js')
			var accountModel = require('../models/accounts_model.js')
			var accountModelMock = jest.spyOn(accountModel.Accounts, "save")
			accountModelMock.mockImplementation(()=>{done()})
			ethAddresses.addAddress("", "")
		});
});



	test('removeAddress function should call accounts.remove once', (done) => {
		const accountsCtrl = require('./accounts_ctrl.js');
		jest.mock('../models/accounts_model.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'remove');
		return accountsCtrl.removeAddress('walletID')
			.then(() => {
				expect(spy).toHaveBeenCalled();
				done();
			});
	});
});


	test('emptyCollection function should call accounts.remove once', (done) => {
		const accountsCtrl = require('./accounts_ctrl.js');
		jest.mock('../models/accounts_model.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'remove');
		return accountsCtrl.emptyCollection()
		.then(() => {
			expect(spy).toHaveBeenCalled();
			done();
		});
	});


