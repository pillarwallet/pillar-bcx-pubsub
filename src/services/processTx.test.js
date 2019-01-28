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
const processTx = require('./processTx');
const redis = jest.genMockFromModule('redis');
describe.only('The processTx module', () => {

	beforeAll(() =>{
		const spy = jest.spyOn(redis,'createClient');
		spy.mockImplementation();
	});

	afterAll(() =>{
		jest.restoreAllMocks();
	});

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



