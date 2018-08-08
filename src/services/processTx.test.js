const processTx = require('./processTx');

describe.only('The processTx module', () => {
  describe('The storeTransactionStats function tests', () => {
    it('should return true', () => {
		const spy = jest.spyOn(processTx, 'storeTransactionStats');
		const ret = true;

		spy.mockImplementation(() => ret);
		expect(processTx.storeTransactionStats()).toEqual(ret);
		spy.mockRestore();
	});
	
    it('should return false', () => {
		const spy = jest.spyOn(processTx, 'storeTransactionStats');
    	const ret = false;

		spy.mockImplementation(() => ret);
		expect(processTx.storeTransactionStats()).toEqual(ret);
		spy.mockRestore();
    });
  });

  describe('The storeTokenEvent function tests', () => {
    it('should return true', () => {
		const spy = jest.spyOn(processTx, 'storeTokenEvent');
		const ret = true;

		spy.mockImplementation((event,asset,protocol,txn) => ret);
		expect(processTx.storeTokenEvent('arg1', 'arg2', 'arg3', 'arg4')).toEqual(ret);
		expect(spy).toBeCalledWith('arg1', 'arg2', 'arg3', 'arg4');
		spy.mockRestore();
    });

    it('should return false', () => {
		const spy = jest.spyOn(processTx, 'storeTokenEvent');
    	const ret = false;

		spy.mockImplementation((event,asset,protocol,txn) => ret);
		expect(processTx.storeTokenEvent('arg1', 'arg2', 'arg3', 'arg4')).toEqual(ret);
		expect(spy).toBeCalledWith('arg1', 'arg2', 'arg3', 'arg4');
		spy.mockRestore();
	});
});
	
	describe('The storeIfRelevant function tests', () => { 
		it('should return true', () => {
			const spy = jest.spyOn(processTx, 'storeIfRelevant');
			const ret = true;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.storeIfRelevant('arg1', 'arg2')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2');
			spy.mockRestore();
		});

		it('should return false', () => {
			const spy = jest.spyOn(processTx, 'storeIfRelevant');
			const ret = false;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.storeIfRelevant('arg1', 'arg2')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2');
			spy.mockRestore();
		});
	});

	describe('The newPendingTran function tests', () => { 
		it('should return true', () => {
			const spy = jest.spyOn(processTx, 'newPendingTran');
			const ret = true;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.newPendingTran('arg1', 'arg2')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2');
			spy.mockRestore();
		});

		it('should return false', () => {
			const spy = jest.spyOn(processTx, 'newPendingTran');
			const ret = false;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.newPendingTran('arg1', 'arg2')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2');
			spy.mockRestore();
		});
	});

	describe('The checkTokenTransfer function tests', () => { 
		it('should return true', () => {
			const spy = jest.spyOn(processTx, 'checkTokenTransfer');
			const ret = true;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.checkTokenTransfer('arg1', 'arg2', 'arg3')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2', 'arg3');
			spy.mockRestore();
		});

		it('should return false', () => {
			const spy = jest.spyOn(processTx, 'checkTokenTransfer');
			const ret = false;
	
			spy.mockImplementation((tx, protocol) => ret);
			expect(processTx.checkTokenTransfer('arg1', 'arg2', 'arg3')).toEqual(ret);
			expect(spy).toBeCalledWith('arg1', 'arg2', 'arg3');
			spy.mockRestore();
		});
	});

});



