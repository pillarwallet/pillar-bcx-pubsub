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
exports.assets = {
  values: () => ['asset1', 'asset2', 'asset3'],
  get: address => ({
    contractAddress:
      '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    symbol: 'ETH',
  }),
};

exports.accounts = {
  has: address => {
    if (
      address === '0x81b7E08F65Bdf5648606c89998A9CC8164397647'.toLowerCase()
    ) {
      return true;
    }
    return false;
  },
  get: () => 'pillarId',
};

exports.pendingTx = {
  get: () => {
    const txObject = {
      pillarId: 'pillarID',
      protocol: 'Ethereum',
      fromAddress: 'fromAddress',
      toAddress: 'toAddress',
      txHash: 'txHash',
      asset: 'asset',
      contractAddress: 'contractAddress',
      timestamp: 'tmstmp',
      blockNumber: 1,
      value: 0.76,
      status: 'pending',
      gasPrice: 4000000000,
      gasUsed: 21000,
    };
    return txObject;
  },
  keys: () => ['txHash1', 'txHash2'],
};
