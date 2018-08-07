const Transactions = (function () {
  return {
    find(query, callback) {
      if (callback == null) {
        query('', [{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
      } else {
        callback('', [{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
      }
    },
    findOne(query, callback) {
      if (callback == null) {
        query('', [{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
      } else {
        callback('', [{_id: "pillarId", txHash: "hash", protocol: "Ethereum"}]);
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
module.exports.Transactions = Transactions;
