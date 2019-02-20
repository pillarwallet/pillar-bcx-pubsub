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
    return {
      getAsync() {
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      },
      existsAsync() {
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      },
      setAsync() {
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      },
      set() {
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      },
      get(data, callback) {
        console.log('is on get');
        if (typeof callback === 'function') {
          callback(false, JSON.stringify({ status: 'completed' }));
        } else {
          return new Promise((resolve, reject) => {
            resolve(false);
          });
        }
      },
      on() {
        return new Promise((resolve, reject) => {
          resolve('testValue');
        });
      },
    };
  },
};

module.exports = redis;
