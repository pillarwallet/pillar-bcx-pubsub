exports.EthAddresses = (function () {
  return {
    find(address, callback) {
      if (callback == null) {
        const newCallback = address;
        const newAddress = 'address';
        newCallback('', [{
          address: newAddress,
          FCMIID: 'FCMIID',
        }]);
      } else {
        callback('', [{
          address,
          FCMIID: 'FCMIID',
        }]);
      }
    },
    findOne(address, callback) {
      if (callback == null) {
        const newCallback = address;
        const newAddress = 'address';
        newCallback('', [{
          address: newAddress,
          FCMIID: 'FCMIID',
        }]);
      } else {
        callback('', [{
          address,
          FCMIID: 'FCMIID',
        }]);
      }
    },
    save() {

    },

    remove(id, callback) {
      if (callback == null) {
        const newCallback = id;
        newCallback('', { result: { n: '9999' } });
      } else {
        callback('', { result: { n: '9999' } });
      }
    },
    update(findParams, updateParams, callback) {
      callback('', 1);
    },
  };
}());
