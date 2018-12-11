const offers = require('./offers_model.js');

describe('Test offers', () => {
	test('offers should be defined', () => {
		expect(offers.Offers).toBeDefined();
	});
});
