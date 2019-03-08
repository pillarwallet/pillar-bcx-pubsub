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

describe('The Accounts Model', () => {
  jest.dontMock('mongoose');
  jest.dontMock('./accounts_model');

  const accountsModel = require('./accounts_model');

  it('successfully returns a valid model when no data supplied', () => {
    const generatedModel = new accountsModel.Accounts();

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that we receive a null value for an unspecified Pillar ID
    expect(generatedModel.pillarId).toEqual(null);

    // Check that we receive an empty array for an unspecified set of addresses
    expect(generatedModel.addresses).toEqual(expect.any(Array));
  });

  it('correctly returns a valid model when some data supplied', () => {
    const generatedModel = new accountsModel.Accounts({
      pillarId: 'abc123',
    });

    // Check the type of the ObjectID
    expect(generatedModel._id.toString()).toEqual(expect.any(String));

    // Check that the value of the pillarId is what we set it to
    expect(generatedModel.pillarId).toBe('abc123');

    // Check that an array is returned
    expect(generatedModel.addresses).toEqual(expect.any(Array));
  });
});
