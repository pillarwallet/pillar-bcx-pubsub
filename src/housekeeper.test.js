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
const housekeeper =  require('./housekeeper.js')

describe.only('Housekeeper unit tests', () => {
	
	afterAll(() => {
		jest.restoreAllMocks();
	});

	beforeAll(() => {
		jest.genMockFromModule('web3');
		jest.genMockFromModule('redis');
		const ethServices = require('./services/ethService');
		const spy = jest.spyOn(ethServices,'connect');
		spy.mockImplementation();
	});
	
	it('process.on should have been called', () => {
		const spy = jest.spyOn(process, 'on');
		spy.mockImplementation();
		spy.call();
		expect(spy).toHaveBeenCalled();
	});

	describe('The init function tests', () => {
		
		it('should have been called once', () => {
			const spy = jest.spyOn(housekeeper, 'init');
			spy.mockImplementation();
			spy.call();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('The recoverWallet function tests', () => {
		
		it('should have been called once', () => {
			const spy = jest.spyOn(housekeeper, 'recoverWallet');
			const recoverAddress = "0x0000000000000000000000000000000000000000";
			const nBlocks = 1;
			spy.mockImplementation();
			spy.call(recoverAddress, nBlocks);
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

});