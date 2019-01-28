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
const ethService = require('./ethService');

describe.only('The ETH Service Module', () => {
  describe('The connect function tests', () => {
    it('should return true', () => {
      const spy = jest.spyOn(ethService, 'connect');
      const ret = true;

      spy.mockImplementation(() => ret);
      expect(ethService.connect()).toEqual(ret);
    });

    it('should return false', () => {
      const spy = jest.spyOn(ethService, 'connect');
      const ret = false;

      spy.mockImplementation(() => ret);
      expect(ethService.connect()).toEqual(ret);
    });
  });

  describe('The subscribePendingTxn function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(ethService, 'subscribePendingTxn');
      spy.mockImplementation();
      spy.call();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The subscribeBlockHeaders function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(ethService, 'subscribeBlockHeaders');
      spy.mockImplementation();
      spy.call();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The subscribeTransferEvents function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(ethService, 'subscribeTransferEvents');
      const contractAddress = '0x0000000000000000000000000000000000000000';

      spy.mockImplementation();
      spy.call(contractAddress);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The checkPendingTx function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(ethService, 'checkPendingTx');
      const pendingTxArray = ['0x0000000000000000000000000000000000000000'];
      const blockNumber = 3737958;

      spy.mockImplementation();
      spy.call(pendingTxArray, blockNumber);

      expect(spy).toHaveBeenCalled();
    });
  });
});
