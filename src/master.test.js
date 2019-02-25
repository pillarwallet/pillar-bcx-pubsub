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
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
});

afterAll(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
});

describe('Test method: master.init()', () => {
  test('Expect master.init() to be called', done => {
    jest.mock('./services/dbServices');
    const master = require('./master');
    const launchMock = jest.spyOn(master, 'launch');
    const launchMockImpl = jest.fn(() => {
      done();
    });
    launchMock.mockImplementation(launchMockImpl);
    master.init({ maxWallets: 10 });
  });
});

describe('Test method: master.notify()', () => {
  test('Expect socket.send() to be called', done => {
    const master = require('./master');
    const socketMock = {
      send: jest.fn(() => {
        done();
      }),
    };
    master.notify('message', socketMock);
  });
});

describe('Test method: master.launch()', () => {
  test('Message assets.request', done => {
    jest.mock('./services/dbServices');
    jest.mock('child_process');
    const dbServices = require('./services/dbServices');
    const childProcess = require('child_process');

    const onMockImpl = {
      on: jest.fn((msg, callback) => {
        callback({ type: 'assets.request' });
      }),
      send: jest.fn(() => {}),
      pid: 1,
    };
    const childProcesMock = jest.spyOn(childProcess, 'fork');
    childProcesMock.mockImplementation(() => onMockImpl);

    const contractsToMonitorMock = jest.spyOn(dbServices, 'contractsToMonitor');
    const doneMock = jest.fn(() => {
      done();
    });
    contractsToMonitorMock.mockImplementation(doneMock);

    const master = require('./master');
    master.launch();
  });

  test('Message wallet.request', done => {
    jest.mock('./services/dbServices');
    jest.mock('child_process');
    const dbServices = require('./services/dbServices');
    const childProcess = require('child_process');

    const onMockImpl = {
      on: jest.fn((msg, callback) => {
        callback({ type: 'wallet.request' });
      }),
      send: jest.fn(() => {}),
      pid: 1,
    };
    const childProcesMock = jest.spyOn(childProcess, 'fork');
    childProcesMock.mockImplementation(() => onMockImpl);

    const contractsToMonitorMock = jest.spyOn(dbServices, 'recentAccounts');
    const doneMock = jest.fn(() => {
      done();
      return new Promise(resolve => {
        resolve();
      });
    });
    contractsToMonitorMock.mockImplementation(doneMock);

    const master = require('./master');
    master.launch();
  });
});
