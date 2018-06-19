const dbServices = require('./services/dbServices');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

const info = logger.info;
const error = logger.error;
const recentAccounts = dbServices.recentAccounts;


describe("Method: master.notify()", () => {

    var master;

    beforeEach(()=> {
        logger.info = jest.fn();
        logger.error = jest.fn();
        dbServices.recentAccounts = jest.fn();

        master = require('./master');

        const id = "id";
        const socket = "socket";
        master.notify(id, socket);
    });

    afterEach(() => {
        logger.info = info;
        logger.error = error;
        dbServices.recentAccounts = recentAccounts;
    });
    it('Expect master.notify() to log start/exit', () => {
        expect(logger.info).toBeCalled();
        expect(logger.info).toBeCalledWith('Started executing master.notify()');
        expect(logger.info).toBeCalledWith('Exited master.notify()');
    });
    it('Expect dbServices.recentAccounts to be called/resolved', () => {
        expect(dbServices.recentAccounts).toBeCalled();
        expect(dbServices.recentAccounts).toBeCalledWith("id");
    });
    it('Expect master.notify() to fail to start', () => {
        expect(logger.error).toBeCalled();
        expect(logger.error).toBeCalledWith("master.notify() failed: TypeError: Cannot read property 'then' of undefined");
    });
});
