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

const moment = require('moment');
const amqp = require('amqplib/callback_api');

jest.mock('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const dbServices = require('./dbServices.js');

afterAll(() => {
  jest.restoreAllMocks();
});
beforeAll(() => {
  jest.restoreAllMocks();
});

describe('Test checksum', () => {
  test('Expect a valid checksum', () => {
    const checksumKey = 'abc';
    const payload = {
      key: 'value',
      checksum:
        'fe21f62624f1cec80d424229c7294dea74621b544c3a5694144dfb4ed97a8486',
    };
    const messageValidStatus = rmqServices.validatePubSubMessage(
      payload,
      checksumKey,
    );
    expect(messageValidStatus).toBe(true);
  });

  test('Expect an invalid checksum', () => {
    const checksumKey = 'abc';
    const payload = {
      key: 'value',
      checksum: 'hello',
    };
    const messageValidStatus = rmqServices.validatePubSubMessage(
      payload,
      checksumKey,
    );
    expect(messageValidStatus).toBe(false);
  });

  test('Expect checksum', () => {
    const checksumKey = 'abc';
    const payload = {
      key: 'value',
    };
    const checkSumValue = rmqServices.calculateChecksum(payload, checksumKey);
    expect(checkSumValue).toBe(
      'fe21f62624f1cec80d424229c7294dea74621b544c3a5694144dfb4ed97a8486',
    );
  });
});

describe('Send PubSubMessage', () => {
  test('Expect call done - initializePubSubChannel', done => {
    const connection = {
      createChannel(param) {
        param(null, { assertQueue: jest.fn(() => done()) });
      },
    };

    rmqServices.initializePubSubChannel(connection);
  });
  test('Expect call done - sendPubSubMessage ', done => {
    const payload = {
      key: 'value',
    };
    const connection = {
      createChannel(param) {
        param(null, {
          sendToQueue: jest.fn(() => done()),
          assertQueue: jest.fn(),
        });
      },
    };
    rmqServices.initializePubSubChannel(connection);
    rmqServices.sendPubSubMessage(payload);
  });
});

describe('GetNotificationPayload', () => {
  test('expect notification value equals', () => {
    const payload = {
      key: 'value',
    };

    const notificationPayload = rmqServices.getNotificationPayload(
      'type',
      payload,
    );
    expect(notificationPayload).toEqual({
      meta: {},
      payload: { key: 'value' },
      type: 'type',
    });
  });
});

describe('TXMAP Reset', () => {
  test('Reset all properties', () => {
    const txMap = {
      1: { timestamp: 5 },
      2: { timestamp: 5 },
    };
    rmqServices.resetTxMap(txMap);

    expect(txMap).toEqual({});
  });
  test('Reset 1 properties', () => {
    const txMap = {
      1: { timestamp: 5 },
      2: { timestamp: moment() },
    };
    rmqServices.resetTxMap(txMap);
    expect(Object.keys(txMap).length).toEqual(1);
  });
  test('Reset zero properties', () => {
    const txMap = {
      '112': { timestamp: moment() },
      '113': { timestamp: moment() },
    };
    rmqServices.resetTxMap(txMap);
    expect(Object.keys(txMap).length).toEqual(2);
  });
});

describe('initsRMQ ', () => {
  test('expectal call done - initPubSubMQ', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, { assertQueue: jest.fn(() => done()) });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    rmqServices.initPubSubMQ();
  });

  test('expectal call done - initSubPubMQ with dummy content type', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, {
            assertQueue: jest.fn(),
            consume(sub, messageHandler) {
              messageHandler({ content: '{"content":"content"}' });
            },
          });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    rmqServices.initSubPubMQ();
    done();
  });

  test('expectal call done - initSubPubMQ with tranStat content type', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const message = { type: 'tranStat' };
    message.checksum = rmqServices.calculateChecksum(message, 'checksumKey');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, {
            assertQueue: jest.fn(),
            consume(sub, messageHandler) {
              messageHandler({ content: JSON.stringify(message) });
            },
          });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    const dbServiceAddTransactionStats = jest.spyOn(
      dbServices,
      'addTransactionStats',
    );
    const dbServiceAddTransactionStatsImpl = jest.fn(() => {
      done();
      return new Promise(resolve => {
        resolve(null);
      });
    });
    dbServiceAddTransactionStats.mockImplementation(
      dbServiceAddTransactionStatsImpl,
    );
    rmqServices.initSubPubMQ();
  });

  test('expectal call done - initSubPubMQ with newAsset content type', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const message = { type: 'newAsset' };
    message.checksum = rmqServices.calculateChecksum(message, 'checksumKey');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, {
            assertQueue: jest.fn(),
            consume(sub, messageHandler) {
              messageHandler({ content: JSON.stringify(message) });
            },
          });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    const dbServiceSaveMock = jest.spyOn(
      dbServices.dbCollections.assets,
      'addContract',
    );
    const dbServiceSaveMockImpl = jest.fn(() => {
      done();
      return new Promise(resolve => {
        resolve(null);
      });
    });
    dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl);
    rmqServices.initSubPubMQ();
  });

  test('expectal call done - initSubPubMQ with updateTx content type', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const message = { type: 'updateTx' };
    message.checksum = rmqServices.calculateChecksum(message, 'checksumKey');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(() => done()),
            consume(sub, messageHandler) {
              messageHandler({ content: JSON.stringify(message) });
            },
          });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    const dbServiceSaveMock = jest.spyOn(
      dbServices.dbCollections.transactions,
      'updateTx',
    );
    const dbServiceSaveMockImpl = jest.fn(
      () =>
        new Promise(resolve => {
          resolve(null);
        }),
    );
    dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl);
    rmqServices.initSubPubMQ();
  });

  test('expectal call done - initSubPubMQ with newTx content type', done => {
    const AmpqConnectMock = jest.spyOn(amqp, 'connect');
    const message = { type: 'newTx' };
    message.checksum = rmqServices.calculateChecksum(message, 'checksumKey');
    const connectionMock = jest.fn((url, method) => {
      method(null, {
        createChannel(param) {
          param(null, {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(() => done()),
            consume(sub, messageHandler) {
              messageHandler({ content: JSON.stringify(message) });
            },
          });
        },
        on: jest.fn(),
      });
    });
    AmpqConnectMock.mockImplementation(connectionMock);
    const dbServiceSaveMockFindeOneByTx = jest.spyOn(
      dbServices.dbCollections.transactions,
      'findOneByTxHash',
    );
    const dbServiceSaveMockFindeOneByTxImpl = jest.fn(
      () =>
        new Promise(resolve => {
          resolve(true);
        }),
    );
    const dbServiceSaveMock = jest.spyOn(
      dbServices.dbCollections.transactions,
      'addTx',
    );
    const dbServiceSaveMockImpl = jest.fn(
      () =>
        new Promise(resolve => {
          resolve(null);
        }),
    );
    dbServiceSaveMockFindeOneByTx.mockImplementation(
      dbServiceSaveMockFindeOneByTxImpl,
    );
    dbServiceSaveMock.mockImplementation(dbServiceSaveMockImpl);
    rmqServices.initSubPubMQ();
  });
});
