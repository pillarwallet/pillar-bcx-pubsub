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
const rmqServices = require('./services/rmqServices.js');
const CronJob = require('cron').CronJob;

var runId = process.argv[2];

describe('Subscriber tests', () => {

  beforeAll(() =>{
    process.argv[2] = 0;
    jest.restoreAllMocks(); 
	});

	afterAll(() =>{
    process.argv[2] = runId;
    jest.restoreAllMocks(); 
	});

  test('Expect initServices() to be called', done => {
    const spy = jest.spyOn(rmqServices, 'initSubPubMQ');
    const dummyMock = () => {
      done()
    }
    const subscriber = require('./subscriber.js');
    spy.mockImplementation(dummyMock);
    subscriber.initServices()
  });

  test('Expect job.start() to be called', done => {
    const spy = jest.spyOn(CronJob.prototype, 'start');
    const dummyMock = () => {
      done()
    }
    spy.mockImplementation(dummyMock);
    const subscriber = require('./subscriber.js');
    subscriber.initServices()
  });

  test('MemoryUsage', done => {
    const spy = jest.spyOn(process, 'memoryUsage');
    const logger = require('./utils/logger');
    const stubLoggerInfo = jest.spyOn(logger, 'info');

    const stubCheckDone = jest.fn((message) => {
      if (message.indexOf("RSS: 0 MB, HEAP: 0 MB, EXTERNAL: 0 MB, TOTAL AVAILABLE: 0 MB") >= 0) {
        stubLoggerInfo.mockRestore();
        done()
      }
    })

    stubLoggerInfo.mockImplementation(stubCheckDone);

    const dummyMock = () => {
      return {
        rss: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      }
    }
    const subscriber = require('./subscriber.js');
    spy.mockImplementation(dummyMock);
    subscriber.logMemoryUsage()
  });
});
