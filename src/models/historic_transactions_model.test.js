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

describe('The HistoricTransactions Model', () => {
  jest.dontMock('mongoose');
  jest.dontMock('./historic_transactions_model');

  const historicTransactionsModel = require('./historic_transactions_model');

  it('successfully returns a valid model when no data supplied', () => {
    const generatedModel = new historicTransactionsModel.HistoricTransactions();

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check the default values of null have been returned
    expect(generatedModel).toMatchObject({
      action: {
        from: null,
        gas: null,
        init: null,
        input: null,
        to: null,
        value: null,
      },
      blockHash: null,
      blockNumber: null,
      result: {
        address: null,
        code: null,
        gasUsed: null,
      },
      transactionHash: null,
      transactionPosition: null,
      type: null,
    });
  });

  it('correctly returns a valid model when some data supplied', () => {
    const generatedModel = new historicTransactionsModel.HistoricTransactions({
      action: {
        from: '0x123',
      },
      blockHash: '1234567890qwerty',
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the 'from' value of the action is what we set it to
    expect(generatedModel.action).toBeDefined();
    expect(generatedModel.action.from).toBe('0x123');

    // Check that blockhash was the value we set it to
    expect(generatedModel.blockHash).toBe('1234567890qwerty');
  });

  it('correctly attempts to convert types when incorrect data types used', () => {
    const generatedModel = new historicTransactionsModel.HistoricTransactions({
      blockNumber: '12345', // Should be a Number
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the blockNumber was converted from a String to a Number
    expect(generatedModel.blockNumber).toBe(12345);
    expect(generatedModel.blockNumber).toEqual(expect.any(Number));
  });
});
