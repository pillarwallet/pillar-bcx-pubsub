const events = require('events');

const connection = new events.EventEmitter();

connection.connect = function (dbUrl) {
  if (dbUrl === 'mongodb://127.0.0.1:27017/PillarBCX') {
    this.emit('open');
  } else {
    this.emit('error');
  }
};
module.exports.connection = connection;

function connect(dbUrl, useMongoClient) {
  return new Promise(((resolve, reject) => {
    try {
      module.exports.connection.connect(dbUrl, useMongoClient);
      resolve();
    } catch (e) {
      reject();
    }
  }));
}
module.exports.connect = connect;

function Schema() {}
module.exports.Schema = Schema;

function model() {
  return ('model');
}
module.exports.model = model;
