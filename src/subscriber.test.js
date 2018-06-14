const dbServices = require('./services/dbServices.js');
var subscriber = require("./subscriber.js");
var amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));
require('dotenv').config();
 
describe('Function Calls', () => {

  it('Expect dbConnect to be called by initServices()', () => {

    const spyConnect = jest.spyOn(dbServices, 'dbConnect').mockImplementation(() => Promise.resolve({ success: true }));
    subscriber.initServices();
    expect(spyConnect).toBeCalled();
    spyConnect.mockRestore() 
  });

  it('Expect amqp.connect to be called by initRabbitMQ()', () => {

    const spyConnect = jest.spyOn(amqp, 'connect');
        subscriber.initRabbitMQ("dummyArg");
        expect(spyConnect).toBeCalled();
        expect(spyConnect).toBeCalledWith('amqp://localhost', expect.anything());
        spyConnect.mockRestore();
  });

})

describe('Checksum', () => {

  it('Expect a valid checksum', () => {
    const payload = {
        key: "value",
        checksum: "d7c5c1fcae6ee55d7522ecf8e27977f2143685e7bbd6ceee2d52317859c1ad0a"  
    }
    expect(subscriber.validate(payload)).toBe(true);
  });

  it('Expect an invalid checksum', () => {
    const payload = {
        key: "value",
        checksum: "hello"  
    }
    expect(subscriber.validate(payload)).toBe(false);
  });
})