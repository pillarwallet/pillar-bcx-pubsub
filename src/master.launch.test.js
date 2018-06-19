var child_process = require('child_process');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

var mockChild = {fork: () => {}};
var master;

describe("Method: master.launch()", () => {
    
    beforeEach(() => {
        mockChild.fork = jest.fn();
        jest.mock("child_process", () => {
            return mockChild;
            });
    });

    afterEach(() => {
        mockChild.fork = child_process.fork;
    });

    it('Expect master.launch() to call fork() with: housekeeper, publisher, and subscriber', () => {
        master = require('./master');
        master.launch();
        expect(mockChild.fork).toBeCalled();
        expect(mockChild.fork).toBeCalledWith(`${__dirname}/housekeeper.js`);
        expect(mockChild.fork).toBeCalledWith(`${__dirname}/publisher.js`);
        expect(mockChild.fork).toBeCalledWith(`${__dirname}/subscriber.js`);
    });
});