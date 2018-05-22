const EthTransactions = (function () {
  return {
    find(query, callback) {
      if (callback == null) {
        query('', 'list of tx');
      } else {
        callback('', 'list of tx');
      }
    },
    findOne(query, callback) {
      if (callback == null) {
        query('', 'list of tx');
      } else {
        callback('', 'list of tx');
      }
    },
    save() {

    },
    update() {

    },
    remove() {

    },
  };
}());
module.exports.EthTransactions = EthTransactions;
