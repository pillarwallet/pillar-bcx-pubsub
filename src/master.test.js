const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));
var master = require('./master');
const dbServices = require('./services/dbServices');

const launch = master.launch;
const info = logger.info;
const error = logger.error;
const recentAccounts = dbServices.recentAccounts;

describe('Method: master.init()', () => {

    afterEach(() => {
        master.launch = launch;
        logger.info = info;
        logger.error = error;
    });

    it('Expect master.launch() to be called', () => {   
        master.launch = jest.fn();
        const options = {
            protocol: "Ethereum",
            maxWallets: 1
        };
        return master.init(options);
        expect(master.launch).toBeCalled();
    });

     it('Expect master.init() to throw an error (maxWallets)', () => {  
        master.launch = jest.fn();
        logger.error = jest.fn();
        const options = {
            protocol: "Ethereum",
            maxWallets: 0
        };
       return master.init(options);
       expect(logger.error).toBeCalled();
       expect(logger.error).toBeCalledWith('master.init() failed: Invalid configuration parameter maxWallets');
    });

    it('Expect master.init() to log start/exit', () => {
        logger.info =  jest.fn();
        master.launch = jest.fn();
        const options = {
            protocol: "Ethereum",
            maxWallets: 1
        };
        return master.init(options)
        expect(logger.info.mock.calls.length).toBe(4);
        expect(logger.info).toBeCalledWith('Started executing master.init()');
        expect(logger.info).toBeCalledWith('master.init(): Initializing master for Ethereum');
        expect(logger.info).toBeCalledWith('master.init(): A new publisher will be spawned for every 1 wallets..');
        expect(logger.info).toBeCalledWith('Exited master.init()');
    });
 });

describe("Method: master.launch()", () => {

    afterEach(() => {
        master.launch = launch;
        logger.info = info;
        logger.error = error;
    });

    it('Expect master.launch() to log start/exit', () => {
        //
        //
        //
    });
});


describe("Method: master.notify()", () => {

    afterEach(() => {
        logger.info = info;
        logger.error = error;
        dbServices.recentAccounts = recentAccounts;
    });
    it('Expect master.notify() to log start/exit', () => {
        logger.info = jest.fn();
        dbServices.recentAccounts = jest.fn();
        const id = "id";
        const socket = "socket";
        master.notify(id, socket);
        expect(logger.info.mock.calls.length).toBe(2);
        expect(logger.info).toBeCalledWith('Started executing master.notify()');
        expect(logger.info).toBeCalledWith('Exited master.notify()');

    });
    it('Expect dbServices.recentAccounts to be called/resolved', () => {
        dbServices.recentAccounts = jest.fn();
        const id = "id";
        const socket = "socket";
        master.notify(id, socket);
        expect(dbServices.recentAccounts).toBeCalled();
        expect(dbServices.recentAccounts).toBeCalledWith("id");
    });
    it('Expect master.notify() to fail to start', () => {
        logger.error = jest.fn();
        dbServices.recentAccounts = jest.fn();
        const id = "id";
        const socket = "socket";
        master.notify();
        expect(logger.error).toBeCalled();
        expect(logger.error).toBeCalledWith("master.notify() failed: TypeError: Cannot read property 'then' of undefined");
    });
});