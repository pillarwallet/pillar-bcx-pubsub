const commandLineArgs = require('command-line-args');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));
var master = require('./master');

describe('Test init()', () => {
    it('Expect master.launch() to be called', () => {
        
        master.launch = jest.fn();
        options = {
            minPort: 8000,
            maxPort: 8080,
            maxWallets: 5e5
        }
        master.init(options);
        expect(master.launch).toBeCalled(); 
    });
  })