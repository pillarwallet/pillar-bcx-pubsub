const rmqServices = require('./services/rmqServices.js');
const CronJob = require('cron').CronJob;

var runId = process.argv[2];

describe('Subscriber tests', () => {

  beforeAll(() =>{
		process.argv[2] = 0;
	});

	afterAll(() =>{
		process.argv[2] = runId;
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
