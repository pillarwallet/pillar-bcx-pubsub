
var runId = process.argv[2];
describe('Test init functions ', () => {

	beforeEach(() =>{
		process.argv[2] = 0;
		jest.clearAllMocks()
		jest.resetAllMocks()
		jest.resetModules()
	});

	afterAll(() =>{
		process.argv[2] = runId;
		jest.clearAllMocks()
		jest.resetAllMocks()
		jest.resetModules()
	});

	test('Expect initIPC to call process.send', () => {
		const spy = jest.spyOn(process, 'send');
		const publisher = require('./publisher.js');
		return publisher.initIPC()
		.then(() => {
			expect(spy).toHaveBeenCalled();
		});
	});


	test('Expect initSubscriptions to call ethServices.subscribePendingTxn and ethServices.subscribeBlockHeaders', () => {
		const dummyMock = jest.fn()
		const publisher = require('./publisher.js');
		const ethServices = require('./services/ethService.js');
		const stubSubscribePendingTxn = jest.spyOn(ethServices, 'subscribePendingTxn');
		const stubSubscribeBlockHeaders = jest.spyOn(ethServices, 'subscribeBlockHeaders');
		stubSubscribePendingTxn.mockImplementation(dummyMock);
		stubSubscribeBlockHeaders.mockImplementation(dummyMock);
		publisher.initSubscriptions();
		expect(stubSubscribePendingTxn).toHaveBeenCalled();
		expect(stubSubscribeBlockHeaders).toHaveBeenCalled();
	});


});

function mockProcessOn(name, message){
	const stubOnProcess = jest.spyOn(process, 'on');
	const stubOnProcessImpl = jest.fn((aux, callback) => {
		callback({ type: name, message: message })
	})
	stubOnProcess.mockImplementation(stubOnProcessImpl);

}

describe('Process on message', () => {
	test('config type message', done => {
		mockProcessOn("config", 1) // could be whatever number
		const logger = require('./utils/logger');
		const dummyMock = jest.fn()
		
		const stubLoggerInfo = jest.spyOn(logger, 'info');
		
		const ethServices = require('./services/ethService.js');
		const stubCheckDone = jest.fn((message) => {
			if (message === "Updated MAX_WALLETS, new value: 1"){
				stubLoggerInfo.mockRestore();
				done()
			}
		})
		
		stubLoggerInfo.mockImplementation(stubCheckDone);
		const publisher = require('./publisher.js');
		const stubSubscribePendingTxn = jest.spyOn(ethServices, 'subscribePendingTxn');
		const stubSubscribeBlockHeaders = jest.spyOn(ethServices, 'subscribeBlockHeaders');
		const stubInitIPC = jest.spyOn(publisher, 'initIPC');
		
		stubSubscribePendingTxn.mockImplementation(dummyMock);
		stubSubscribeBlockHeaders.mockImplementation(dummyMock);
		stubInitIPC.mockImplementation(dummyMock);
	});

	test('assets type message', done => {
		const dummyMock = jest.fn()
		const ethServices = require('./services/ethService.js');
		const stubCheckDone = jest.fn((message) => {
			if (message.contractAddress === "contractAddress") {
				done()
			}
		})
		mockProcessOn("assets", [{contractAddress: "contractAddress"}])
		const stubSubscribeTransferEvents = jest.spyOn(ethServices, 'subscribeTransferEvents');
		stubSubscribeTransferEvents.mockImplementation(stubCheckDone);
		

		const stubSubscribePendingTxn = jest.spyOn(ethServices, 'subscribePendingTxn');
		const stubSubscribeBlockHeaders = jest.spyOn(ethServices, 'subscribeBlockHeaders');
		
		stubSubscribePendingTxn.mockImplementation(dummyMock);
		stubSubscribeBlockHeaders.mockImplementation(dummyMock);
		
		const publisher2 = require('./publisher.js');
		publisher2.publisherOnMessage()
		const stubInitIPC = jest.spyOn(publisher2, 'initIPC');
		stubInitIPC.mockImplementation(dummyMock);
	
	});

	test('accounts type message', done => {
		mockProcessOn("accounts", [{ walletId: "walletId2" ,id: 1}]) // could be whatever number
		const logger = require('./utils/logger');
		const dummyMock = jest.fn()

		const stubLoggerInfo = jest.spyOn(logger, 'info');

		const ethServices = require('./services/ethService.js');
		const stubCheckDone = jest.fn((message) => {
			if (message === "Updated redis with latestId: 1") {
				stubLoggerInfo.mockRestore();
				done()
			}
		})

		stubLoggerInfo.mockImplementation(stubCheckDone);
		const publisher = require('./publisher.js');
		const stubSubscribePendingTxn = jest.spyOn(ethServices, 'subscribePendingTxn');
		const stubSubscribeBlockHeaders = jest.spyOn(ethServices, 'subscribeBlockHeaders');
		const stubInitIPC = jest.spyOn(publisher, 'initIPC');

		stubSubscribePendingTxn.mockImplementation(dummyMock);
		stubSubscribeBlockHeaders.mockImplementation(dummyMock);
		stubInitIPC.mockImplementation(dummyMock);
		publisher.publisherOnMessage()
	});
})



describe('Poll method', () => {
	test('Expect poll to call process.send', () => {
		const dummyMock = jest.fn()
		const spy = jest.spyOn(process, 'send');
		const publisher = require('./publisher.js');
		const stubInitIPC = jest.spyOn(publisher, 'initIPC');
		stubInitIPC.mockImplementation(dummyMock);
		publisher.poll()
		expect(spy).toHaveBeenCalled();
	});
})