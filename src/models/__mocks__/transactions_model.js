const Transactions = (function () {
  return {
    find(query, callback) {
      if (callback == null) {
        query('', [{_id: "pillarId", txHash: "hash"}]);
      } else {
        callback('', [{_id: "pillarId", txHash: "hash"}]);
      }
    },
    findOne(query, callback) {
      if (callback == null) {
        query('', [{_id: "pillarId", txHash: "hash"}]);
      } else {
        callback('', [{_id: "pillarId", txHash: "hash"}]);
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
