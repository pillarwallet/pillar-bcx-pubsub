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
