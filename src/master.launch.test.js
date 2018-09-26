const master = require('./master');

describe('Test method: master.launch()', () => {
  test('Expect master.launch() to be called', () => {
    const spy = jest.spyOn(master, 'launch');
    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});
