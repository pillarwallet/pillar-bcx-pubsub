const sinon = require('sinon');

describe('Test method: master.launch()', () => {
	test('Expect master.launch() to call fork() with: housekeeper, publisher, and subscriber', () => {

		const childProcess = require('child_process');
		const stub = sinon.stub(childProcess, 'fork');
		stub.returns()
		const master = require('./master');

		master.launch();
		sinon.assert.calledThrice(stub);
		sinon.assert.calledWith(stub, `${__dirname}/housekeeper.js`);
		sinon.assert.calledWith(stub, `${__dirname}/publisher.js`);
		sinon.assert.calledWith(stub, `${__dirname}/subscriber.js`);
		stub.restore();
	});
});
