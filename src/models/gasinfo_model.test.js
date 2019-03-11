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

describe('The GasInfo Model', () => {
  jest.dontMock('mongoose');
  jest.dontMock('./gasinfo_model');

  const gasInfoModel = require('./gasinfo_model');

  it('successfully returns a valid model when no data supplied', () => {
    const generatedModel = new gasInfoModel.GasInfo();

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check the default values of null have been returned
    expect(generatedModel).toMatchObject({
      avgGasPrice: null,
      blockNumber: null,
      gasLimit: null,
      gasUsed: null,
      protocol: null,
      transactionCount: null,
    });
  });

  it('correctly returns a valid model when some data supplied', () => {
    const generatedModel = new gasInfoModel.GasInfo({
      gasUsed: 12345,
      protocol: 'pr0t0c0l',
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the gasUsed is what we set it to
    expect(generatedModel.gasUsed).toBe(12345);
  });

  it('correctly attempts to convert types when incorrect data types used', () => {
    const generatedModel = new gasInfoModel.GasInfo({
      gasUsed: '12345', // Should be a Number
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the gasUsed was converted from a String to a Number
    expect(generatedModel.gasUsed).toBe(12345);
    expect(generatedModel.gasUsed).toEqual(expect.any(Number));
  });
});
