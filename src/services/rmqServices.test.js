const sinon = require('sinon');

describe('Test checksum', () => {
	test('Expect a valid checksum', () => {
		checksumKey = 'abc';
		const payload = {
			key: 'value',
			checksum: 'fe21f62624f1cec80d424229c7294dea74621b544c3a5694144dfb4ed97a8486',
		};
		const rmqServices = require('./rmqServices.js');
		expect(rmqServices.validatePubSubMessage(payload, checksumKey)).toBe(true);
	});

	test('Expect an invalid checksum', () => {
		checksumKey = 'abc';
		const payload = {
			key: 'value',
			checksum: 'hello',
		};
		const rmqServices = require('./rmqServices.js');
		expect(rmqServices.validatePubSubMessage(payload, checksumKey)).toBe(false);
	});
});
