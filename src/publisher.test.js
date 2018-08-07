const sinon = require('sinon');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test init functions ', () => {
	test('Expect initIPC to call logger.info, process.send', () => {
		const spy = sinon.spy(process, 'send');
		const spy2 = sinon.spy(logger, 'info');
		const publisher = require('./publisher.js');
		return publisher.initIPC()
		.then(() => {
			sinon.assert.called(spy);
			sinon.assert.called(spy2);
			sinon.assert.calledWith(spy2, 'Started executing publisher.initIPC()');
			sinon.assert.calledWith(spy2, 'Publisher requesting master a list of assets to monitor');
			sinon.assert.calledWith(spy2, 'Publisher initializing the RMQ');
			sinon.assert.calledWith(spy2, 'Publisher polling master for new wallets every 5 seconds');
			sinon.assert.calledWith(spy2, 'Exited publisher.initIPC()');
			spy.restore();
			spy2.restore();
		});
	});

	test('Expect poll to call process.send', () => {
		const spy = sinon.spy(process, 'send');
		const publisher = require('./publisher.js');
		publisher.poll();
		sinon.assert.called(spy);
		spy.restore();
	});

	test('Expect initSubscriptions to call ethServices.subscribePendingTxn and ethServices.subscribeBlockHeaders', () => {
		const publisher = require('./publisher.js');
		const ethServices = require('./services/ethService.js');
		const stub1 = sinon.stub(ethServices, 'subscribePendingTxn');
		const stub2 = sinon.stub(ethServices, 'subscribeBlockHeaders');
		publisher.initSubscriptions();
		sinon.assert.called(stub1);
		sinon.assert.called(stub2);
		stub1.restore();
		stub2.restore();
	});
});
