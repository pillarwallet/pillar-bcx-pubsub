const gethSubscribe = require('./gethSubscribe.js');

describe('The gethSubscribe Module', () => {
  describe('The gethSubscribe function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(gethSubscribe, 'subscribePendingTx');

      spy.mockImplementation();
      spy.call();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The subscribeBlockHeaders function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(gethSubscribe, 'subscribeBlockHeaders');

      spy.mockImplementation();
      spy.call();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The subscribeAllDBERC20SmartContracts function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(gethSubscribe, 'subscribeAllDBERC20SmartContracts');

      spy.mockImplementation();
      spy.call();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('The subscribeERC20SmartContract function tests', () => {
    it('should have been called once', () => {
      const spy = jest.spyOn(gethSubscribe, 'subscribeERC20SmartContract');
      const contract = { contractAddress: '0x0000000000000000000000000000000000000000' };

      spy.mockImplementation();
      spy.call(contract);

      expect(spy).toHaveBeenCalled();
    });
  });
});
