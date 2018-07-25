const dbServices = require('./services/dbServices.js');
const rmqServices = require('./services/rmqServices.js');
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

  it('Expect amqp.connect to be called by initSubPubMQ()', () => {

    const spyConnect = jest.spyOn(amqp, 'connect');
		rmqServices.initSubPubMQ();
		expect(spyConnect).toBeCalled();
		const rmqUrl = "amqp://" + process.env.MQ_BCX_USERNAME + ":" + process.env.MQ_BCX_PASSWORD + "@" + process.env.RABBITMQ_SERVER;
        expect(spyConnect).toBeCalledWith(rmqUrl, expect.anything());
        spyConnect.mockRestore();
  });
});

