
const assets = require('./assets_model.js');

describe('Test assets', () => {
	test('assets should be defined', (done) => {
		expect(assets.Assets).toBeDefined();
		done();
	});
});
