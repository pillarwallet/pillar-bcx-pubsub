beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.resetModules()
});

afterAll(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.resetModules()
});


describe('Test method: master.init()', () => {
  test('Expect master.init() to be called', done => {
    jest.mock('./services/dbServices')
    const master = require('./master');
    const options = {protocol: 'Ethereum', maxWallets: 500000};
    var launchMock = jest.spyOn(master, 'launch');
    var launchMockImpl = jest.fn(() => { done() })
    launchMock.mockImplementation(launchMockImpl)
    master.init({ maxWallets: 10})

  });
});

describe('Test method: master.notify()', () => {
  test('Expect socket.send() to be called', done => {
    const master = require('./master');
    var socketMock = {
      send: jest.fn(()=>{done()})
    }
    master.notify("message", socketMock)

  });
});



describe('Test method: master.launch()', () => {
  test('Message assets.request', done => {
    jest.mock('./services/dbServices')
    jest.mock('child_process')
    var dbServices = require('./services/dbServices')
    var childProcess = require('child_process')

    var onMockImpl = {on: jest.fn((msg, callback) => {
      callback({ type: "assets.request"}) 
    }),
      send: jest.fn(() => { }), 
      pid:1
  }
     var childProcesMock = jest.spyOn(childProcess, 'fork');
    childProcesMock.mockImplementation(() => { return onMockImpl })

    var contractsToMonitorMock = jest.spyOn(dbServices, 'contractsToMonitor');
    var doneMock = jest.fn(() => { done() })
    contractsToMonitorMock.mockImplementation(doneMock)

    const master = require('./master');
    master.launch()


  });

  test('Message wallet.request', done => {
    jest.mock('./services/dbServices')
    jest.mock('child_process')
    var dbServices = require('./services/dbServices')
    var childProcess = require('child_process')

    var onMockImpl = {
      on: jest.fn((msg, callback) => {
        callback({ type: "wallet.request" })
      }),
      send: jest.fn(() => { }),
      pid: 1
    }
    var childProcesMock = jest.spyOn(childProcess, 'fork');
    childProcesMock.mockImplementation(() => { return onMockImpl })

    var contractsToMonitorMock = jest.spyOn(dbServices, 'recentAccounts');
    var doneMock = jest.fn(() => {
      done(); return new Promise((resolve, reject) => {
        resolve(s)
      })})
    contractsToMonitorMock.mockImplementation(doneMock)

    const master = require('./master');
    master.launch()


  });
});