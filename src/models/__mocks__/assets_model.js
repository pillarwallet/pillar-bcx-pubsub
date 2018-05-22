const SmartContracts = (function () {
  return {
    find(params, callback) {
      if (callback == null) {
        const newCallback = params;
        newCallback('', 'list of smacos');
      } else {
        callback('', 'list of smacos');
      }
    },
    findOne(params, callback) {
      callback('', `${params.ticker}smaco`);
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
module.exports.SmartContracts = SmartContracts;
