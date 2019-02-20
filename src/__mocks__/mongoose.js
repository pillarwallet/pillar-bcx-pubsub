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
const events = require('events');

const connection = new events.EventEmitter();

connection.connect = function(dbUrl) {
  this.emit('open');
  /*
  if (dbUrl === 'mongodb://127.0.0.1:27017/PillarBCX') {
    this.emit('open');
  } else {
    this.emit('error');
  }
  */
};
module.exports.connection = connection;

function connect(dbUrl, useMongoClient) {
  return new Promise((resolve, reject) => {
    try {
      module.exports.connection.connect(
        dbUrl,
        useMongoClient,
      );
      resolve();
    } catch (e) {
      reject();
    }
  });
}
module.exports.connect = connect;

const types = {
  ObjectId: () => {},
};
module.exports.Types = types;

function Schema() {}
module.exports.Schema = Schema;

function model() {
  return 'model';
}
module.exports.model = model;
