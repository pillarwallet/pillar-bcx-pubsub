const processTx = require('./processTx');
const Web3 = require('web3');
jest.mock('./dbServices.js')
const dbServices = require('./dbServices.js')


afterAll(() => {
  jest.restoreAllMocks();
});

beforeAll(() => {
  jest.restoreAllMocks();
});


  describe('The connect function tests', () => {
    test('should return true', done => {
      const ethService = require('./ethService');
      ethService.connect().then( value =>{
        expect(value).toBe(true)
        done()
      })
  });
})

describe('getWeb3 function', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    ethService.getWeb3().then(value => {
      expect(value).toEqual({})
      done()
    })
  });
});

  describe('The subscribePendingTxn function tests', () => {
    test('newPendingTran should have been called ', (done) => {
      const ethService = require('./ethService');
      const processTxNewPendingTranMock = jest.spyOn(processTx, 'newPendingTran');
      var doneFn = jest.fn(() => done())
      processTxNewPendingTranMock.mockImplementation(doneFn);
      ethService.subscribePendingTxn()
    });
  });



  describe('The subscribeBlockHeaders function tests', () => {
    test('should have been called once', done => {
      const ethService = require('./ethService');
      const checkPendingTxMock = jest.spyOn(ethService, 'checkPendingTx');
      const checkNewAssetsMock = jest.spyOn(ethService, 'checkNewAssets');
      const storeGasInfoMock = jest.spyOn(ethService, 'storeGasInfo');
      var doneFn = jest.fn(() => { storeGasInfoMock.mockRestore(); checkNewAssetsMock.mockRestore();checkPendingTxMock.mockRestore();done()})
      var dummyFn = jest.fn()
      var dummyPromiseFn = jest.fn(() => {  return new Promise(((resolve) => {
        resolve(true);
      }))})
      checkPendingTxMock.mockImplementation(dummyPromiseFn);
      checkNewAssetsMock.mockImplementation(dummyFn);
      storeGasInfoMock.mockImplementation(doneFn);
      ethService.subscribeBlockHeaders()
    });
  });

describe('The storeGasInfo function tests', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    const rmqServices = require('./rmqServices');
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    var doneFn = jest.fn(() => done())
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(value => {
      ethService.storeGasInfo({ number: Web3.transactions[0].blockNumber, hash: Web3.transactions[0].blockHash })
      expect(value).toBe(true)
    })
  });
});

  describe('The subscribeTransferEvents function tests', () => {
    test('should have been called once', done => {
      const contractAddress = '0x0000000000000000000000000000000000000000';
      const ethService = require('./ethService');
      const checkTokenTransferMock = jest.spyOn(processTx, 'checkTokenTransfer');
      var doneFn = jest.fn(() => done())
      checkTokenTransferMock.mockImplementation(doneFn);
      ethService.subscribeTransferEvents(contractAddress)
    });
  });

describe('The getBlockTx function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getBlockTx(blockNumber).then(value => {
      done()
    })
  })
});

describe('The getBlockNumber function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getBlockNumber(blockNumber).then(value => {
      done()
    })
  })
});

describe('The getLastBlockNumber function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getLastBlockNumber(blockNumber).then(value => {
      done()
    })
  })
});

describe('The getTxReceipt function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getTxReceipt(blockNumber).then(value => {
      done()
    })
  })
});


describe('The getBlockTransactionCount function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getBlockTransactionCount(blockNumber).then(value => {
      done()
    })
  })
});

describe('The getPendingTxArray function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    var doneFn = jest.fn(() => done())
    ethService.getPendingTxArray(blockNumber).then(value => {
      done()
    })
  })
});



  describe('The checkPendingTx function tests', () => {
    test('should have been called once', done => {
      const rmqServices = require('./rmqServices');
      const ethService = require('./ethService');
      const pendingTxArray = [{ toAddress: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b', txHash: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b'}];
      const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
      var doneFn = jest.fn(() => done())
      rmqServiceMock.mockImplementation(doneFn);
      ethService.checkPendingTx(pendingTxArray)
    });
  });


describe('The checkNewAssets function tests', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    const pendingTxArray = ['0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b'];
    const addERC20Mock = jest.spyOn(ethService, 'addERC20');
    var doneFn = jest.fn(() => {addERC20Mock.mockRestore();done()})
    addERC20Mock.mockImplementation(doneFn);
    ethService.checkNewAssets(pendingTxArray)
  });
});

describe('The addERC20 function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const contractAddressObj = { status: "0x1" , contractAddress: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b' };
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    var doneFn = jest.fn(() => done())
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(value => {
      ethService.addERC20(contractAddressObj)
    })
  });
});

describe('The addERC721 function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const contractAddressObj = { status: "0x1", contractAddress: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b' };
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    var doneFn = jest.fn(() => done())
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(value => {
      ethService.addERC721(contractAddressObj)
    })
  });
});

describe('The getPastEvents function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const address = 'string';
    ethService.getPastEvents([], "symbol", "Transfer", 0, address)
    const dbServicesMock = jest.spyOn(dbServices.dbCollections.transactions, 'addTx');
    var doneFn = jest.fn(() => done())
    dbServicesMock.mockImplementation(doneFn);
  });
});

describe('The getAllTransactionsForWallet function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const txHash = '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b'
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    var doneFn = jest.fn(() => done())
    rmqServiceMock.mockImplementation(doneFn);
    ethService.getAllTransactionsForWallet(txHash)
    done()
  });
});