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

describe('The Assets Model', () => {
  jest.dontMock('mongoose');
  jest.dontMock('./assets_model');

  const assetsModel = require('./assets_model');

  it('successfully returns a valid model when no data supplied', () => {
    const generatedModel = new assetsModel.Assets();

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check the default values of null have been returned
    expect(generatedModel).toMatchObject({
      contractAddress: null,
      decimals: null,
      name: null,
      protocol: null,
      symbol: null,
      totalSupply: null,
      url: null,
    });

    // The category field is not required. Check that this is undefined.
    expect(generatedModel.category).toBeUndefined();
  });

  it('correctly returns a valid model when some data supplied', () => {
    const generatedModel = new assetsModel.Assets({
      name: 'PLR',
      totalSupply: 150000,
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the gasUsed is what we set it to
    expect(generatedModel.totalSupply).toBe(150000);
  });

  it('correctly attempts to convert types when incorrect data types used', () => {
    const generatedModel = new assetsModel.Assets({
      totalSupply: '987654321', // Should be a Number
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the gasUsed was converted from a String to a Number
    expect(generatedModel.totalSupply).toBe(987654321);
    expect(generatedModel.totalSupply).toEqual(expect.any(Number));
  });
});
