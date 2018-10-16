const master = require('./master');
describe('Test method: master.init()', () => {
  test('Expect master.init() to be called', () => {
    const options = {protocol: 'Ethereum', maxWallets: 500000};
    const spy = jest.spyOn(master, 'init');
    spy.mockImplementation();
    spy.call(options);

    expect(spy).toHaveBeenCalled();
  });
});
