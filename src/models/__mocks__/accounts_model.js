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
const Accounts = class Accounts {
  save(callback){
    Accounts.save(callback)
  }
}

  Accounts.find = function(address, callback) {
    
    if (callback == null && typeof address == "function")  {
      const newCallback = address;
      const newAddress = 'address';
      newCallback('', [{
        address: newAddress
      }]);
    } else if (callback == null && typeof address == "object"){
        return{
          sort: function (params) {
            return { limit: function (params) {
              return{
                exec: function(callback){
                  callback(false, [{ "address": "address" }])
                }
              }
            }
          }
        }
      }
    }
      else {
      callback('', [{
        address
      }]);
    }
  }

  Accounts.findOne = function(address, callback) {
    if (callback == null) {
      const newCallback = address;
      const newAddress = 'address';
      newCallback('', [{
        address: newAddress
      }]);
    } else {
      callback('', [{
        address
      }]);
    }
  }

  Accounts.remove= function(id, callback) {
    if (callback == null) {
      const newCallback = id;
      newCallback('', { result: { n: '9999' } });
    } else {
      callback('', { result: { n: '9999' } });
    }
  }

  Accounts.update = function(findParams, updateParams, callback) {
    callback('', 1);
  }


  Accounts.save = function (callback) {
    callback(false)
  }

module.exports.Accounts = Accounts;

