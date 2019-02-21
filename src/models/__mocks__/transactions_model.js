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
const Transactions = class Transactions {
  save(callback) {
    callback(false);
  }
};

Transactions.find = function(query, callback) {
  const returnValue = [
    { _id: 'pillarId', txHash: 'hash', protocol: 'Ethereum' },
  ];
  if (query && typeof query === 'function' && callback == null) {
    query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    callback('', returnValue);
  } else {
    return new Promise((resolve, reject) => {
      resolve(returnValue);
    });
  }
};

Transactions.findOne = function(query, callback) {
  const returnValue = [
    { _id: 'pillarId', txHash: 'hash', protocol: 'Ethereum' },
  ];
  if (query && typeof query === 'function' && callback == null) {
    query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    callback('', returnValue);
  } else {
    return new Promise((resolve, reject) => {
      resolve(returnValue);
    });
  }
};

Transactions.aggregate = function(query, callback) {
  const returnValue = [{ balance: 5 }];
  if (query && typeof query === 'function' && callback == null) {
    query('', returnValue);
  } else if (callback != null && typeof callback === 'function') {
    callback('', returnValue);
  } else {
    return new Promise((resolve, reject) => {
      resolve(returnValue);
    });
  }
};

Transactions.save = function() {};

Transactions.update = function() {};

Transactions.remove = function() {};

module.exports.Transactions = Transactions;
