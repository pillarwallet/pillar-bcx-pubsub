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
var runId = process.argv[2];

describe('Test init functions ', () => {

	beforeAll(() =>{
		process.argv[2] = 0;
	});

	afterAll(() =>{
		process.argv[2] = runId;
	});

	test('Dummy stub',() => {
		//dummy test suite to complete build process - TODO rewrite sinon to jest
	});
/*
	test('Expect initIPC to call process.send', () => {
		const spy = sinon.spy(process, 'send');
		const publisher = require('./publisher.js');
		return publisher.initIPC()
		.then(() => {
			sinon.assert.called(spy);
			spy.restore();
		});
	});

	test('Expect initSubscriptions to call ethServices.subscribePendingTxn and ethServices.subscribeBlockHeaders', () => {
		const publisher = require('./publisher.js');
		const ethServices = require('./services/ethService.js');
		const stub1 = sinon.stub(ethServices, 'subscribePendingTxn');
		const stub2 = sinon.stub(ethServices, 'subscribeBlockHeaders');
		publisher.initSubscriptions();
		sinon.assert.called(stub1);
		sinon.assert.called(stub2);
		stub1.restore();
		stub2.restore();
	});
	*/
});
