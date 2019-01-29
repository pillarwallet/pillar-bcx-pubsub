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

	beforeAll(() => {
		jest.restoreAllMocks();
		const ethServices = require('./services/ethService');
		const spy = jest.spyOn(ethServices,'connect');
		spy.mockImplementation();
		jest.spyOn(process, 'exit').mockImplementation(() => { });
	});

	describe('The recoverAll function tests less than MAX_TOTAL_TRANSACTIONS', () => {

		it('should have been called', done => {
			jest.mock('./services/ethService');
			jest.mock('./services/dbServices.js')
			var dbServices = require('./services/dbServices.js')
			const ethServices = require('./services/ethService');
			const housekeeper = require('./housekeeper.js')
			const spy = jest.spyOn(housekeeper, 'recoverTransactions');
			var recoverAllMockImpl = () => {
				return new Promise((resolve, reject) => {
					resolve([{ transactionHash: "hash" }])
				})
			}
			spy.mockImplementation(recoverAllMockImpl);
			const dbServicesAddTxMock = jest.spyOn(dbServices.dbCollections.transactions, 'addTx');
			var dbServicesAddTxMockImpl = function () {
				done()
			}
			dbServicesAddTxMock.mockImplementation(dbServicesAddTxMockImpl);
			housekeeper.recoverAll("wallet", "pillarId")
		});
	});

	describe('The init function tests', () => {

		it('should have been called once', done => {
			jest.mock('web3');
			jest.mock('redis');
			const housekeeper = require('./housekeeper.js')
			housekeeper.init()
			var processDataMock = jest.spyOn(housekeeper, 'processData')
			processDataMock.mockImplementation(() => { processDataMock.mockRestore(); done() });
			
		});
	});

	describe('The processData function tests', () => {
		
		it('should have been called', done => {
			const logger = require('./utils/logger');
			jest.spyOn(process, 'exit').mockImplementation(() => { });
			jest.mock('./services/ethService');
			jest.mock('./services/dbServices.js')
			const housekeeper = require('./housekeeper.js')
			const spy = jest.spyOn(housekeeper, 'recoverAll');
			var recoverAllMockImpl = () =>{  return new Promise((resolve, reject) => {
					resolve([{ txHash: "hash" }])
				})
			}
			spy.mockImplementation(recoverAllMockImpl);

			const loggerLog = jest.spyOn(logger, 'info');
			var loggerLogMockImpl = function(log){
				if (log.indexOf("Completed processing") >=0 ){
					done()
				}
			}
			loggerLog.mockImplementation(loggerLogMockImpl);
			housekeeper.processData(5, 4, "from")
		});
	});


	describe('The checkTxPool function tests', () => {
		it('should have been called', done => {
			jest.mock('./services/ethService');
			jest.mock('./services/dbServices.js')
			const housekeeper = require('./housekeeper.js')
			housekeeper.checkTxPool(5, 4, "from").then(() => {
				done()
			})

		});
	});
