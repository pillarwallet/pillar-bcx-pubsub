const sinon = require('sinon');

describe('Test init functions ', () => {
	test('Expect initIPC to call logger.info, process.send', (done) => {
		const spy = sinon.spy(process, 'send');
		const logger = require('./utils/logger');
		const spy2 = sinon.spy(logger, 'info');

	//	const rmqServices = require('./services/rmqServices.js');
	//	const stub = sinon.stub(rmqServices, 'initPubSubMQ');
	//	stub.resolves();

		const publisher = require('./publisher.js');
	//	const stub2 = sinon.stub(publisher, 'initSubscriptions');
	//	stub2.resolves();

	//	const stub3 = sinon.stub(publisher, 'poll');
	//	stub3.resolves();

		publisher.initIPC()
		.then(() => {
			sinon.assert.called(spy);
			sinon.assert.called(spy2);
			sinon.assert.calledWith(spy2, 'Started executing publisher.initIPC()');
			sinon.assert.calledWith(spy2, 'Publisher requesting master a list of assets to monitor');
			sinon.assert.calledWith(spy2, 'Publisher initializing the RMQ');
			sinon.assert.calledWith(spy2, 'Publisher polling master for new wallets every 5 seconds');
			sinon.assert.calledWith(spy2, 'Exited publisher.initIPC()');
			// sinon.assert.calledOnce(stub);
			// sinon.assert.calledOnce(stub2);
			// sinon.assert.calledOnce(stub3);
			spy.restore();
			spy2.restore();
		//	stub.restore();
		//	stub2.restore();
		//	stub3.restore();
			done();
		});
	});

	test('Expect poll to call process.send', () => {
		const spy = sinon.spy(process, 'send');
		const publisher = require('./publisher.js');
		publisher.poll();
		sinon.assert.called(spy);
		spy.restore();
	});

	test('Expect initSubscriptions to call gethConnect.gethConnectDisplay(), dbServices.dbConnectDisplayAccounts(),' +
		' gethSubscribe.subscribePendingTx() and gethSubscribe.subscribeBlockHeaders', (done) => {

		const gethConnect = require('./services/gethConnect.js');
		const stub1 = sinon.stub(gethConnect, 'gethConnectDisplay');
		stub1.resolves();
		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices, 'dbConnectDisplayAccounts');
		stub2.resolves();
		const gethSubscribe = require('./services/gethSubscribe.js');
		const stub3 = sinon.stub(gethSubscribe, 'subscribePendingTx');
		stub3.resolves();
		const stub4 = sinon.stub(gethSubscribe, 'subscribeBlockHeaders');
		stub4.resolves();

		const publisher = require('./publisher.js');
		return publisher.initSubscriptions()
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			sinon.assert.called(stub4);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			done();
		})

	});
});
