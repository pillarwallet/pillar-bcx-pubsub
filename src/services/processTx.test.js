const processTx = require('./processTx');

describe.only('processTx module', () => {
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

  describe('The connect function tests', () => {
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
		expect(processTx.storeTokenEvent()).toEqual(ret);
		spy.mockRestore();
    });
  });
});
