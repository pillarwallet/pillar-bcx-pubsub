
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

<<<<<<< HEAD
=======
/* eslint-disable */
>>>>>>> Added ignore to test files
const Transactions = class Transactions {
  save(callback) {
    callback(false);
  }
};

Transactions.find = (query, callback) => {
  const returnValue = [
    { _id: 'pillarId', txHash: 'hash', protocol: 'Ethereum' },
  ];
  if (query && typeof query === 'function' && callback == null) {
    return query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    return callback('', returnValue);
  }
  return new Promise(resolve => {
    resolve(returnValue);
  });
};

Transactions.findOne = (query, callback) => {
  const returnValue = [
    { _id: 'pillarId', txHash: 'hash', protocol: 'Ethereum' },
  ];
  if (query && typeof query === 'function' && callback == null) {
    return query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    return callback('', returnValue);
  }
  return new Promise(resolve => {
    resolve(returnValue);
  });
};

Transactions.aggregate = (query, callback) => {
  const returnValue = [{ balance: 5 }];
  if (query && typeof query === 'function' && callback == null) {
    return query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    return callback('', returnValue);
  }
  return new Promise(resolve => {
    resolve(returnValue);
  });
};

Transactions.save = () => {};

Transactions.update = () => {};

Transactions.remove = () => {};

module.exports.Transactions = Transactions;
