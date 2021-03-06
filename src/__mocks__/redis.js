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

const redis = {
  createClient() {
    return { getAsync() {
        return new Promise(resolve => {
          resolve(false);
        });
      }, existsAsync() {
        return new Promise(resolve => {
          resolve(false);
        });
      }, setAsync() {
        return new Promise(resolve => {
          resolve(false);
        });
      }, set() {
        return new Promise(resolve => {
          resolve(false);
        });
      }, hset() {
        return new Promise(resolve => {
          resolve(true);
        });
      }, hgetall() {
        return new Promise(resolve => {
          resolve(true);
        });
      }, get(data, callback) {
        if (typeof callback === 'function') {
          return callback(false, JSON.stringify({ status: 'completed' }));
        }
        return new Promise(resolve => {
          resolve(false);
        });
      }, on() {
        return new Promise(resolve => {
          resolve('testValue');
        });
      },
      hkeys() {
        return new Promise(resolve => {
          resolve(['0xTransaction1','0xTransaction2']);
        });
      },
    };
  },
};

module.exports = redis;
