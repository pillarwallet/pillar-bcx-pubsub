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

/* eslint-disable */

const processTx = require('./processTx');
const Web3 = require('web3');

jest.mock('./dbServices.js');

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
});

describe('getWeb3 function', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    ethService.getWeb3().then(value => {
      expect(value).toEqual({});
      done();
    });
  });
});

describe('The subscribePendingTxn function tests', () => {
  test('newPendingTran should have been called ', done => {
    const ethService = require('./ethService');
    const processTxNewPendingTranMock = jest.spyOn(processTx, 'newPendingTran');
    const doneFn = jest.fn(() => done());
    processTxNewPendingTranMock.mockImplementation(doneFn);
    ethService.subscribePendingTxn();
  });
});

describe('The subscribeBlockHeaders function tests', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    const checkPendingTxMock = jest.spyOn(ethService, 'checkPendingTx');
    const checkNewAssetsMock = jest.spyOn(ethService, 'checkNewAssets');
    const storeGasInfoMock = jest.spyOn(ethService, 'storeGasInfo');
    const doneFn = jest.fn(() => {
      storeGasInfoMock.mockRestore();
      checkNewAssetsMock.mockRestore();
      checkPendingTxMock.mockRestore();
      done();
    });
    const dummyFn = jest.fn();
    const dummyPromiseFn = jest.fn(
      () =>
        new Promise(resolve => {
          resolve(true);
        }),
    );
    checkPendingTxMock.mockImplementation(dummyPromiseFn);
    checkNewAssetsMock.mockImplementation(dummyFn);
    storeGasInfoMock.mockImplementation(doneFn);
    ethService.subscribeBlockHeaders();
  });
});

describe('The storeGasInfo function tests', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    const rmqServices = require('./rmqServices');
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    const doneFn = jest.fn(() => done());
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(value => {
      ethService.storeGasInfo({
        number: Web3.transactions[0].blockNumber,
        hash: Web3.transactions[0].blockHash,
      });
      expect(value).toBe(true);
    });
  });
});

describe('The subscribeTransferEvents function tests', () => {
  test('should have been called once', done => {
    const contractAddress = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    const checkTokenTransferMock = jest.spyOn(processTx, 'checkTokenTransfer');
    const doneFn = jest.fn(() => done());
    checkTokenTransferMock.mockImplementation(doneFn);
    ethService.subscribeTransferEvents(contractAddress);
  });
});

describe('The getBlockTx function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    ethService.getBlockTx(blockNumber).then(() => {
      done();
    });
  });
});

describe('The getBlockNumber function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    ethService.getBlockNumber(blockNumber).then(() => {
      done();
    });
  });
});

describe('The getLastBlockNumber function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    ethService.getLastBlockNumber(blockNumber).then(() => {
      done();
    });
  });
});

describe('The getTxReceipt function tests', () => {
  test('should have been called once', done => {
    const blockNumber =
      '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b';
    const ethService = require('./ethService');
    ethService.getTxReceipt(blockNumber).then(() => {
      done();
    });
  });
});

describe('The getBlockTransactionCount function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    ethService.getBlockTransactionCount(blockNumber).then(() => {
      done();
    });
  });
});

describe('The getPendingTxArray function tests', () => {
  test('should have been called once', done => {
    const blockNumber = '0x0000000000000000000000000000000000000000';
    const ethService = require('./ethService');
    ethService.getPendingTxArray(blockNumber).then(() => {
      done();
    });
  });
});

describe('The checkPendingTx function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const pendingTxArray = [
      {
        toAddress:
          '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
        txHash:
          '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
      },
    ];
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    const doneFn = jest.fn(message => {
      const messageKeys = [
        'type',
        'txHash',
        'protocol',
        'fromAddress',
        'toAddress',
        'value',
        'asset',
        'contractAddress',
        'status',
        'gasUsed',
        'blockNumber',
        'input',
      ];
      // Check that the message have all the keys
      const allKeysInArray = messageKeys.every(
        elem => Object.keys(message).indexOf(elem) > -1,
      );
      if (allKeysInArray) {
        done();
      }
    });
    rmqServiceMock.mockImplementation(doneFn);
    ethService.checkPendingTx(pendingTxArray);
  });
});

describe('The checkNewAssets function tests', () => {
  test('should have been called once', done => {
    const ethService = require('./ethService');
    const pendingTxArray = [
      '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    ];
    const addERC20Mock = jest.spyOn(ethService, 'addERC20');
    const doneFn = jest.fn(() => {
      addERC20Mock.mockRestore();
      done();
    });
    addERC20Mock.mockImplementation(doneFn);
    ethService.checkNewAssets(pendingTxArray);
  });
});

describe('The addERC20 function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const contractAddressObj = {
      status: '0x1',
      contractAddress:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    };
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    const doneFn = jest.fn(() => done());
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(() => {
      ethService.addERC20(contractAddressObj);
    });
  });
});

describe('The addERC721 function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const contractAddressObj = {
      status: '0x1',
      contractAddress:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    };
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    const doneFn = jest.fn(() => done());
    rmqServiceMock.mockImplementation(doneFn);
    ethService.connect().then(() => {
      ethService.addERC721(contractAddressObj);
    });
  });
});

describe('The getAllTransactionsForWallet function tests', () => {
  test('should have been called once', done => {
    const rmqServices = require('./rmqServices');
    const ethService = require('./ethService');
    const txHash =
      '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b';
    const rmqServiceMock = jest.spyOn(rmqServices, 'sendPubSubMessage');
    const doneFn = jest.fn(() => done());
    rmqServiceMock.mockImplementation(doneFn);
    ethService.getAllTransactionsForWallet(txHash);
    done();
  });
});

describe('The getTxInfo function tests', () => {
  test('should return the txObject with the same hash', done => {
    const ethService = require('./ethService');
    ethService.getTxInfo(Web3.ethTxHash).then(txObject => {
      expect(txObject.txHash).toBe(Web3.ethTxHash);
      done();
    });
  });
});
