

const accounts = require('./accounts_model.js');

describe('Test accounts', () => {
	test('accounts should be defined', () => {
		expect(accounts.Accounts).toBeDefined();
	});
});
