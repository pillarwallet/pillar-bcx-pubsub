const sinon = require('sinon');
var ethService = require('./ethService.js');
const Web3 = require('web3');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Connect', () => {
	test('Expect connect() to call web3', () => {
		const stub = sinon.stub(Web3);
		stub.resolves();
		

		sinon.assert.calledTwice(stub);
	});
});
