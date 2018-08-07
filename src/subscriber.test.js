const subscriber = require('./subscriber.js');

describe('Test function calls', () => {
  test('Expect initServices() to be called', () => {
    const spy = jest.spyOn(subscriber, 'initServices');
    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});
