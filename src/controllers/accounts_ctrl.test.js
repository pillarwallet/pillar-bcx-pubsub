afterAll(() => {
	jest.restoreAllMocks();
});

describe('Test accounts.listAll function', () => {
	test("listAll function should call accounts.find once and return [{'FCMIID': 'FCMIID', 'address': 'address'}]", (done) => {
		jest.mock('../models/accounts_model.js');
		const accountsCtrl = require('./accounts_ctrl.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'find');
		return accountsCtrl.listAll()
		.then((result) => {
			expect(result).toEqual([{ FCMIID: 'FCMIID', address: 'address' }]);
			expect(spy).toHaveBeenCalled();
			done();
		});
		// })
	});

	test('findByAddress function should call accounts.findOne once', (done) => {
		const accountsCtrl = require('./accounts_ctrl.js');
		jest.mock('../models/accounts_model.js');
		const accountsModel = require('../models/accounts_model.js');
		const spy = jest.spyOn(accountsModel.Accounts, 'findOne');
		return accountsCtrl.findByAddress('address')
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


	// ISSUE WITH MOCKING CONSTRUCTOR AND SPYING ON THE INSTANCE
	/*
describe('Test ethAddresses.addAddress function', () => {
		test("add function should create an ethAddresses.ethAdresses instance once and save it", (done) => {
				let dbServices=require('../services/dbServices.js')
				let url='mongodb://127.0.0.1:27017/PillarBCX'
				jest.mock('mongoose')
				var mongoose = require('mongoose');
				return dbServices.dbConnect(url)
				.then(function(){
						let ethAddresses = require('./accounts_ctrl.js');
						jest.mock('../models/accounts_model.js')
						let ethAddressesModel=require('../models/accounts_model.js')
						let spy=jest.spyOn(ethAddressesModel,"ethAddresses")// DID NOT MANAGE TO SPY ON CONSTRUCTOR INSTANCE
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

