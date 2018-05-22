function addTx() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.addTx = addTx;

function updateTx() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.updateTx = updateTx;

function addTxHistory() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.addTxHistory = addTxHistory;

function findByTxHash() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.findByTxHash = findByTxHash;

function listPending() {
  const transactions = [
    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x06e8511b535abcffd4e715429358540a0e2b94ca4b9f1c67a58c42868193138a',
      input: '0x',
      nonce: 1243024,
      to: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583',
      transactionIndex: 0,
      value: '1000000000000000000',
      v: '0x1b',
      r: '0x2ddcfd04d0b8981282b78492e31a682da493b16a1352b37299ee9e82bb375a9',
      s: '0x219990f145beba06660a1563ad9c6ed91c5b88b80134554e1ac458ace9484f4b',
    },

    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x10b01e7af83a2d2e97f649eaec6d2590d3ac06f0834d226bab83dc1f01874b52',
      input: '0x',
      nonce: 1243025,
      to: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C',
      transactionIndex: 1,
      value: '1000000000000000000',
      v: '0x1b',
      r: '0xef527a17bb1d1a110b7c09efdb645273fb4db6527b4b08d210e8a2855986b99b',
      s: '0x73a1a3e47d4c13b288c74f138feeeca3878b13a553c74ca4d8dfa7279358743e',
    },

    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x6f298f0a65077269cb30c95af525800c5840d080725dc47fad16d9d3d5810bfb',
      input: '0x',
      nonce: 1243026,
      to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
      transactionIndex: 2,
      value: '1000000000000000000',
      v: '0x1c',
      r: '0x74d43f34de8623341c9521ee88d67bfb75eeaba840ecd5de337561fa23128e4b',
      s: '0x6d6a96c26fda642ce427d93378b982f00ce0ebb5b1ab2ed8c1d499890f98a709',
    },
  ];

  const receipt = {
    blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    contractAddress: null,
    cumulativeGasUsed: 1944627,
    from: '0xdc8f20170c0946accf9627b3eb1513cfd1c0499f',
    gasUsed: 261731,
    logs:
    [],
    logsBloom: '0x00000000000000000000000000000000000000000000',
    status: '0x1',
    to: '0x39ada2edf9bda495fce0278c7a66331cdffdbec1',
    transactionHash: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    transactionIndex: 14,
  };

  const pendingTxArray = [

    {
      _id: 'id1',
      transaction: transactions[0],
      receipt,
      to: transactions[0].to,
      from: transactions[0].from,
      tmstmp: 1234567890,
      asset: 'ETH',
      value: 1,
      nbConfirmations: 0,
      status: 'pending',
    },
    {
      _id: 'id2',
      transaction: transactions[1],
      receipt,
      to: transactions[1].to,
      from: transactions[1].from,
      tmstmp: 1234567890,
      asset: 'BOKKY',
      value: 1,
      nbConfirmations: 0,
      status: 'pending',
    },
    {
      _id: 'id2',
      transaction: transactions[2],
      receipt,
      to: transactions[2].to,
      from: transactions[2].from,
      tmstmp: 1234567890,
      asset: 'BOKKY',
      value: 2,
      nbConfirmations: 0,
      status: 'pending',
    },
  ];

  return new Promise(((resolve) => {
    resolve(pendingTxArray);
  }));
}
module.exports.listPending = listPending;

function listHistory() {
  const transactions = [
    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x06e8511b535abcffd4e715429358540a0e2b94ca4b9f1c67a58c42868193138a',
      input: '0x',
      nonce: 1243024,
      to: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583',
      transactionIndex: 0,
      value: '1000000000000000000',
      v: '0x1b',
      r: '0x2ddcfd04d0b8981282b78492e31a682da493b16a1352b37299ee9e82bb375a9',
      s: '0x219990f145beba06660a1563ad9c6ed91c5b88b80134554e1ac458ace9484f4b',
    },

    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x10b01e7af83a2d2e97f649eaec6d2590d3ac06f0834d226bab83dc1f01874b52',
      input: '0x',
      nonce: 1243025,
      to: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C',
      transactionIndex: 1,
      value: '1000000000000000000',
      v: '0x1b',
      r: '0xef527a17bb1d1a110b7c09efdb645273fb4db6527b4b08d210e8a2855986b99b',
      s: '0x73a1a3e47d4c13b288c74f138feeeca3878b13a553c74ca4d8dfa7279358743e',
    },

    {
      blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      blockNumber: 2461146,
      from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
      gas: 21000,
      gasPrice: '120000000000',
      hash: '0x6f298f0a65077269cb30c95af525800c5840d080725dc47fad16d9d3d5810bfb',
      input: '0x',
      nonce: 1243026,
      to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
      transactionIndex: 2,
      value: '1000000000000000000',
      v: '0x1c',
      r: '0x74d43f34de8623341c9521ee88d67bfb75eeaba840ecd5de337561fa23128e4b',
      s: '0x6d6a96c26fda642ce427d93378b982f00ce0ebb5b1ab2ed8c1d499890f98a709',
    },
  ];

  const receipt = {
    blockHash: '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    contractAddress: null,
    cumulativeGasUsed: 1944627,
    from: '0xdc8f20170c0946accf9627b3eb1513cfd1c0499f',
    gasUsed: 261731,
    logs:
    [],
    logsBloom: '0x00000000000000000000000000000000000000000000',
    status: '0x1',
    to: '0x39ada2edf9bda495fce0278c7a66331cdffdbec1',
    transactionHash: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    transactionIndex: 14,
  };

  const historyTxArray = [

    {
      _id: 'id1',
      transaction: transactions[0],
      receipt,
      to: transactions[0].to,
      from: transactions[0].from,
      tmstmp: 1234567890,
      asset: 'ETH',
      value: 1,
      nbConfirmations: 0,
      status: 'history',
    },
    {
      _id: 'id2',
      transaction: transactions[1],
      receipt,
      to: transactions[1].to,
      from: transactions[1].from,
      tmstmp: 1234567890,
      asset: 'BOKKY',
      value: 1,
      nbConfirmations: 0,
      status: 'history',
    },
    {
      _id: 'id2',
      transaction: transactions[2],
      receipt,
      to: transactions[2].to,
      from: transactions[2].from,
      tmstmp: 1234567890,
      asset: 'BOKKY',
      value: 2,
      nbConfirmations: 0,
      status: 'history',
    },
  ];

  return new Promise(((resolve) => {
    resolve(historyTxArray);
  }));
}
module.exports.listHistory = listHistory;

function listDbZeroConfTx() {
  return new Promise(((resolve) => {
    resolve([]);
  }));
}
module.exports.listDbZeroConfTx = listDbZeroConfTx;

function updateTxHistoryHeight() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.updateTxHistoryHeight = updateTxHistoryHeight;

function findTxHistoryHeight() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.findTxHistoryHeight = findTxHistoryHeight;

function addZeroTxHistoryHeight() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.addZeroTxHistoryHeight = addZeroTxHistoryHeight;

function getTxHistory() {
  return new Promise(((resolve) => {
    resolve({ TxHist: 'TxHistory' });
  }));
}
module.exports.getTxHistory = getTxHistory;

function emptyCollection() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.emptyCollection = emptyCollection;

