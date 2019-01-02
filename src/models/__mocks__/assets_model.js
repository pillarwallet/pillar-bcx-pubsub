const Assets = (function () {
  return {

    find(query, callback) {
      const returnValue = 'list of assets'
      if (query && typeof query === "function" && callback == null) {
        query('', returnValue);
      } else if (callback != null && typeof callback === "function") {
        callback('', returnValue);
      } else {
        return new Promise((resolve, reject) => {
          resolve(returnValue)
        })
      }
    },
    findOne(params, callback) {
      callback('', `${params.symbol}asset`);
    },
    save() {
    },
    remove() {
    },
    update(params, update, callback) {
      callback('');
    },
  };
}());
module.exports.Assets = Assets;
