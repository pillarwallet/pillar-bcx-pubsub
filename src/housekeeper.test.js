	
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
