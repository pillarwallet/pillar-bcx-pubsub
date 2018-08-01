const housekeeper =  require('./housekeeper.js')
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe.only('Housekeeper unit tests', () => {
	
	afterAll(() => {
		jest.restoreAllMocks();
	});

	describe('The init function tests', () => {
		
		it('should return true', () => {
			const spy = jest.spyOn(housekeeper, 'init');
			spy.mockImplementation();
			spy.call();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('The recoverWallet function tests', () => {
		
		it('should have been called once', () => {
			const spy = jest.spyOn(housekeeper, 'recoverWallet');
			spy.mockImplementation();
			spy.call();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});


	describe('The checkTxPool function tests', () => {
		
		it('should have been called once', () => {
			const spy = jest.spyOn(housekeeper, 'checkTxPool');
			spy.mockImplementation();
			spy.call();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('The updateTxHistory function tests', () => {
		
		it('should have been called once', () => {
			const spy = jest.spyOn(housekeeper, 'updateTxHistory');
			spy.mockImplementation();
			spy.call();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

});