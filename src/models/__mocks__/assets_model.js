const Assets = (function () {
  return {
    find(params, callback) {
      if (callback == null) {
        const newCallback = params;
        newCallback('', 'list of assets');
      } else {
        callback('', 'list of assets');
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
