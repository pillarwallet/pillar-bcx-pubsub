const sinon = require('sinon');
const Web3 = require('web3');
const logger = require('./utils/logger');
logger.transports.forEach((t) => (t.silent = true));

describe('Connect', () => {
	test('Expect connect() to call web3', () => {
		
	});
});
