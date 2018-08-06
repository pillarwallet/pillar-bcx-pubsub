const sinon = require('sinon');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test init functions ', () => {
	test('Expect initIPC to call logger.info, process.send', (done) => {
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
		const gethSubscribe = require('./services/gethSubscribe.js');
		const stub2 = sinon.stub(gethSubscribe, 'subscribePendingTx');
		stub2.resolves();
		const stub3 = sinon.stub(gethSubscribe, 'subscribeBlockHeaders');
		stub3.resolves();
		const stub4 = sinon.stub(gethSubscribe, 'subscribeAllDBERC20SmartContracts');
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