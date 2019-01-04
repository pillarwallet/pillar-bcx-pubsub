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
        address: newAddress,
        FCMIID: 'FCMIID',
      }]);
    } else if (callback == null && typeof address == "object"){
        return{
          limit: function (params) {
            return{
            exec: function(callback){
              callback(false, [{ "FCMIID": "FCMIID", "address": "address" }])
            }
          }
        }
      }
    }
      else {
      callback('', [{
        address,
        FCMIID: 'FCMIID',
      }]);
    }
  }

  Accounts.findOne = function(address, callback) {
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

