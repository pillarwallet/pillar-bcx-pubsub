const commandLineArgs = require('command-line-args');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));
var master = require('./master');

describe('Method: master.init()', () => {
    it('Expect master.launch() to be called', () => {   
        master.launch = jest.fn();
        const options = {
            protocol: "Ethereum",
            maxWallets: 1
        }
        master.init(options);
        expect(master.launch).toBeCalled(); 
        master.launch.mockRestore();
    });

    it('Expect master.init() to throw an error (maxWallets)', () => {  
        logger.error =  jest.fn();
        master.launch = jest.fn();

        const options = {
            protocol: "Ethereum",
            maxWallets: 0
        }
        master.init(options)
        expect(logger.error).toBeCalled();
        expect(logger.error).toBeCalledWith('master.init() failed: Invalid configuration parameter maxWallets');
        logger.error.mockRestore();
        master.launch.mockRestore();
    });
})