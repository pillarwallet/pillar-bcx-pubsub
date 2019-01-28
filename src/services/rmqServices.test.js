/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
