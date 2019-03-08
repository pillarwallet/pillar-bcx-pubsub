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

describe('The Transaction Model', () => {
  jest.dontMock('mongoose');
  jest.dontMock('./transactions_model');
  const transactions = require('./transactions_model');

  it('successfully returns a valid model when no data supplied', () => {
    const generated = new transactions.Transactions();

    expect(generated).toMatchObject({
      pillarId: null,
      protocol: null,
      fromAddress: null,
      toAddress: null,
      txHash: null,
      asset: null,
      contractAddress: null,
      timestamp: null,
      blockNumber: null,
      value: null,
      status: null,
      gasPrice: null,
      gasUsed: null,
    });

    expect(generated._id.toString()).toEqual(expect.any(String));
  });

  it('correctly generate a valid model when some data is supplied', () => {
    const generated = new transactions.Transactions({
      pillarId: 'abc123',
      protocol: 'eth',
      asset: 'JEST',
      value: 0,
    });

    // Assert the random ID
    expect(generated._id.toString()).toEqual(expect.any(String));

    // Assert a value that has not been specified
    expect(generated.timestamp).toEqual(null);

    // Assert the provided values
    expect(generated.pillarId).toEqual('abc123');
    expect(generated.protocol).toEqual('eth');
    expect(generated.asset).toEqual('JEST');

    // Asset a type
    expect(generated.value).toEqual(0);
    expect(generated.value).toEqual(expect.any(Number));
  });
});
