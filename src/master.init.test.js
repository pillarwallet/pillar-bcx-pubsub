const master = require('./master');

describe('Test method: master.init()', () => {
  test('Expect master.init() to be called', () => {
    const spy = jest.spyOn(master, 'init');
    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});
