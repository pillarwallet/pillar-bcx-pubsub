const sinon = require('sinon');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Test method: master.notify()', () => {
	test('Expect master.notify() to log start/exit and dbServices.recentAccounts to be called/resolved', () => {

		const dbServices = require('./services/dbServices.js');
		const stub = sinon.stub(dbServices, 'recentAccounts');
		stub.resolves({wallets: 'wallets'});

		const spy = sinon.spy(logger, 'info');

		const master = require('./master');
		const stub2 = sinon.stub(master, 'init');
		stub2.resolves()

		const id = "id";
		const socket = "socket";

		master.notify(id, socket);
		sinon.assert.called(spy);
		sinon.assert.calledWith(spy, 'Started executing master.notify()');
		sinon.assert.calledWith(spy, 'Exited master.notify()');

		sinon.assert.calledOnce(stub);
		sinon.assert.calledWith(stub, 'id');


		spy.restore();
		stub.restore();
		stub2.restore();
	});

});
