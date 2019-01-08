
let moment = require('moment');
let amqp = require('amqplib/callback_api');
jest.mock('./dbServices.js')
let rmqServices = require('./rmqServices.js');
let dbServices = require('./dbServices.js');

afterAll(() => {
	jest.restoreAllMocks(); 
});	
beforeAll(() => {
	jest.restoreAllMocks();
});

describe('Test checksum', () => {
	test('Expect a valid checksum', () => {
		checksumKey = 'abc';
		let payload = {
			key: 'value',
			checksum: 'fe21f62624f1cec80d424229c7294dea74621b544c3a5694144dfb4ed97a8486',
		};
		let messageValidStatus = rmqServices.validatePubSubMessage(payload, checksumKey)
		expect(messageValidStatus).toBe(true);
	});

	test('Expect an invalid checksum', () => {
		checksumKey = 'abc';
		let payload = {
			key: 'value',
			checksum: 'hello',
		};
		let messageValidStatus = rmqServices.validatePubSubMessage(payload, checksumKey)
		expect(messageValidStatus).toBe(false);
	});

	test('Expect checksum', () => {
		checksumKey = 'abc';
		let payload = {
			key: 'value'
		};
		let checkSumValue = rmqServices.calculateChecksum(payload, checksumKey)
		expect(checkSumValue).toBe('fe21f62624f1cec80d424229c7294dea74621b544c3a5694144dfb4ed97a8486');
	});

});


describe('Send PubSubMessage', () => {
	test('Expect call done - initializePubSubChannel', done => {
		var connection = {
			createChannel:function(param){
				param(null, { assertQueue: jest.fn(()=> done())})

			}
		}

		rmqServices.initializePubSubChannel(connection)
	});
	test('Expect call done - sendPubSubMessage ', done => {
		let payload = {
			key: 'value'
		};
		var connection = {
			createChannel: function (param) {
				param(null, { sendToQueue: jest.fn(() => done()) , assertQueue: jest.fn() })

			}
		}
		rmqServices.initializePubSubChannel(connection)
		rmqServices.sendPubSubMessage(payload)
	});
})

describe('GetNotificationPayload', () => {
	test('expect notification value equals',() => {
		let payload = {
			key: 'value'
		};

		let notificationPayload = rmqServices.getNotificationPayload("type", payload)
		expect(notificationPayload).toEqual(
			{ "meta": {}, "payload": { "key": "value" }, "type": "type" })
	});
})

describe('TXMAP Reset', () => {
	test('Reset all properties', () => {

		var txMap= {
			1: { timestamp: 5 },
			2: { timestamp: 5 }
		};
		rmqServices.resetTxMap(txMap)

		expect(txMap).toEqual({})
	});
	test('Reset 1 properties', () => {

		var txMap = {
			1: { timestamp: 5 },
			2: { timestamp: moment() }
		};
		rmqServices.resetTxMap(txMap)
		expect(Object.keys(txMap).length).toEqual(1)
	});
	test('Reset zero properties', () => {

		var txMap = {
			"112": { timestamp: moment() },
			"113": { timestamp: moment() }
		};
		rmqServices.resetTxMap(txMap)
		expect(Object.keys(txMap).length).toEqual(2)
	});
})

describe('initsRMQ ', () => {
	test('expectal call done - initPubSubMQ', done => {

		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null, { assertQueue: jest.fn(() => done()) })

				},
				 on: jest.fn()})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		rmqServices.initPubSubMQ()
	});

	test('expectal call done - initSubPubMQ with dummy content type', done => {

		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null, 
					{ assertQueue: jest.fn() ,
					consume: function (sub ,messageHandler) {
						messageHandler({ content: '{"content":"content"}'})
					}})

				},
				on: jest.fn()
			})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		rmqServices.initSubPubMQ()
		done()
	});

	test('expectal call done - initSubPubMQ with tranStat content type', done => {

		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		var message = {"type":"tranStat"}
		message.checksum = rmqServices.calculateChecksum(message)
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null,
						{
							assertQueue: jest.fn(),
							consume: function (sub, messageHandler) {
								messageHandler({ content: JSON.stringify(message) })
							}
						})

				},
				on: jest.fn()
			})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		let dbServiceAddTransactionStats = jest.spyOn(dbServices, "addTransactionStats")
		let dbServiceAddTransactionStatsImpl = jest.fn(() => {
			done()
			return new Promise((resolve, reject) => { resolve(null) })

		})
		dbServiceAddTransactionStats.mockImplementation(dbServiceAddTransactionStatsImpl)
		rmqServices.initSubPubMQ()
	});

	test('expectal call done - initSubPubMQ with newAsset content type', done => {
		
		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		var message = { "type": "newAsset" }
		message.checksum = rmqServices.calculateChecksum(message)
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null,
						{
							assertQueue: jest.fn(),
							consume: function (sub, messageHandler) {
								messageHandler({ content: JSON.stringify(message) })
							}
						})

				},
				on: jest.fn()
			})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		let dbServiceSaveMock = jest.spyOn(dbServices.dbCollections.assets, "addContract")
		let dbServiceSaveMockImpl = jest.fn(() => {
			done()
			return new Promise((resolve, reject) => { resolve(null) })
			
		})
		dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl)
		rmqServices.initSubPubMQ()
	});

	test('expectal call done - initSubPubMQ with updateTx content type', done => {

		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		var message = { "type": "updateTx" }
		message.checksum = rmqServices.calculateChecksum(message)
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null,
						{
							assertQueue: jest.fn(),
							sendToQueue: jest.fn(() => done()),
							consume: function (sub, messageHandler) {
								messageHandler({ content: JSON.stringify(message) })
							}
						})

				},
				on: jest.fn()
			})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		let dbServiceSaveMock = jest.spyOn(dbServices.dbCollections.transactions, "updateTx")
		let dbServiceSaveMockImpl = jest.fn(() => {
			return new Promise((resolve, reject) => { resolve(null) })

		})
		dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl)
		rmqServices.initSubPubMQ()
	});

	test('expectal call done - initSubPubMQ with newTx content type', done => {

		let AmpqConnectMock = jest.spyOn(amqp, "connect")
		var message = { "type": "newTx" }
		message.checksum = rmqServices.calculateChecksum(message)
		let connectionMock = jest.fn((url, method) => {
			method(null, {
				createChannel: function (param) {
					param(null,
						{
							assertQueue: jest.fn(),
							sendToQueue: jest.fn(() => done()),
							consume: function (sub, messageHandler) {
								messageHandler({ content: JSON.stringify(message) })
							}
						})

				},
				on: jest.fn()
			})
		})
		AmpqConnectMock.mockImplementation(connectionMock);
		let dbServiceSaveMockFindeOneByTx = jest.spyOn(dbServices.dbCollections.transactions, "findOneByTxHash")
		let dbServiceSaveMockFindeOneByTxImpl = jest.fn(() => {
			return new Promise((resolve, reject) => { resolve(true) })

		})
		let dbServiceSaveMock = jest.spyOn(dbServices.dbCollections.transactions, "addTx")
		let dbServiceSaveMockImpl = jest.fn(() => {
			return new Promise((resolve, reject) => { resolve(null) })
		})
		dbServiceSaveMockFindeOneByTx.mockImplementation(dbServiceSaveMockFindeOneByTxImpl)
		dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl)
		rmqServices.initSubPubMQ()
	});
})