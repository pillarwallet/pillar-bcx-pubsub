var child_process = require('child_process');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

var mockRequest = {fork: () => {}};
var master;

describe("Method: master.launch()", () => {
    
    beforeEach(() => {
        mockRequest.fork = jest.fn();
        jest.mock("child_process", () => {
            return mockRequest;
            });
    });

    afterEach(() => {
        mockRequest.fork = child_process.fork;
    });

    it('Expect master.launch() to call fork() with: housekeeper, publisher, and subscriber', () => {
        master = require('./master');
        master.launch();
        expect(mockRequest.fork).toBeCalled();
        expect(mockRequest.fork).toBeCalledWith(`${__dirname}/housekeeper.js`);
        expect(mockRequest.fork).toBeCalledWith(`${__dirname}/publisher.js`);
        expect(mockRequest.fork).toBeCalledWith(`${__dirname}/subscriber.js`);
    });
});