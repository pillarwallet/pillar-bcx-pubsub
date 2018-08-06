const gasinfo = require('./gasinfo_model.js');

describe('Test gasinfo', () => {
	test('gasinfo should be defined', () => {
		expect(gasinfo.GasInfo).toBeDefined();
	});
});
