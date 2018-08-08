const master = require('./master');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test method: master.init()', () => {
  test('Expect master.init() to be called', () => {
    const spy = jest.spyOn(master, 'init');
    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});
