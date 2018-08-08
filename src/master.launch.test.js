const master = require('./master');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test method: master.launch()', () => {
  test('Expect master.launch() to be called', () => {
    const spy = jest.spyOn(master, 'launch');
    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});
