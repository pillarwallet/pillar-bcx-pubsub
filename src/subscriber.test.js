const sinon = require('sinon');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test function calls', () => {
	test('Expect dbConnect and initPubSubMQ to be called by initServices()', (done) => {
		const dbServices = require('./services/dbServices.js');
		const stub = sinon.stub(dbServices, 'dbConnect');
		stub.resolves();

		const rmqServices = require('./services/rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'initSubPubMQ');
		stub2.resolves();

		const subscriber = require('./subscriber.js')
		subscriber.initServices()
		.then(() => {
			sinon.assert.calledTwice(stub);
			sinon.assert.calledTwice(stub2);
			stub.restore();
			stub2.restore();
			done();
		});
	});
});
