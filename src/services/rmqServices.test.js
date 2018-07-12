const sinon = require('sinon');

describe('Test checksum', () => {
	test('Expect a valid checksum', () => {
		const payload = {
			key: 'value',
			checksum: 'd7c5c1fcae6ee55d7522ecf8e27977f2143685e7bbd6ceee2d52317859c1ad0a',
		};
		const rmqServices = require('./rmqServices.js');
		expect(rmqServices.validatePubSubMessage(payload)).toBe(true);
	});

	test('Expect an invalid checksum', () => {
		const payload = {
			key: 'value',
			checksum: 'hello',
		};
		const rmqServices = require('./rmqServices.js');
		expect(rmqServices.validatePubSubMessage(payload)).toBe(false);
	});
});
