const sinon = require('sinon');
var runId = process.argv[2];

describe('Test init functions ', () => {

	beforeAll(() =>{
		process.argv[2] = 0;
	});

	afterAll(() =>{
		process.argv[2] = runId;
	});

	test('Expect initIPC to call process.send', () => {
		const spy = sinon.spy(process, 'send');
		const publisher = require('./publisher.js');
		return publisher.initIPC()
		.then(() => {
			sinon.assert.called(spy);
			spy.restore();
		});
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
