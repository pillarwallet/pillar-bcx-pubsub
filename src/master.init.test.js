const dbServices = require('./services/dbServices');
const logger = require('./utils/logger');

logger.transports.forEach((t) => (t.silent = true));

const info = logger.info;
const error = logger.error;

describe('Method: master.init()', () => {
  let options;
  let master;
  let launch;

  beforeEach(() => {
    logger.error = jest.fn();
    logger.info = jest.fn();
    dbServices.recentAccounts = jest.fn();
    master = require('./master');
    launch = master.launch;
    master.launch = jest.fn();
    options = {
      protocol: "Ethereum",
      maxWallets: 1
    };
  });

  afterEach(() => {
    logger.info = info;
    logger.error = error;
    master.launch = launch;
  });

  it('Expect master.launch() to be called', () => {
    master.init(options);
    expect(master.launch).toBeCalled();
  });

  it('Expect master.init() to throw an error (maxWallets)', () => {
    options.maxWallets = 0;
    master.init(options);
    expect(logger.error).toBeCalled();
    expect(logger.error).toBeCalledWith('master.init() failed: Invalid configuration parameter maxWallets');
  });

  it('Expect master.init() to log start/exit', () => {
    master.init(options)
    expect(logger.info).toBeCalled();
    expect(logger.info).toBeCalledWith('Started executing master.init()');
    expect(logger.info).toBeCalledWith('master.init(): Initializing master for Ethereum');
    expect(logger.info).toBeCalledWith('master.init(): A new publisher will be spawned for every 1 wallets..');
    expect(logger.info).toBeCalledWith('Exited master.init()');
  });
});
