const Transactions = class Transactions {
  save(callback){
    callback(false)

  }
}

Transactions.find = function(query, callback) {
  const returnValue = [{ _id: "pillarId", txHash: "hash", protocol: "Ethereum" }]
  if (query && typeof query === "function" && callback == null) {
    query('', returnValue);
  } else if(callback != null && typeof callback === "function"){
    callback('', returnValue);
  }else{
    return new Promise((resolve, reject) => {
      resolve(returnValue)
    })
  }
}

Transactions.findOne = function (query, callback) {
  const returnValue = [{ _id: "pillarId", txHash: "hash", protocol: "Ethereum" }]
  if (query && typeof query === "function" && callback == null) {
    query('', returnValue);
  } else if (callback != null && typeof callback === "function") {
    callback('', returnValue);
  } else {
    return new Promise((resolve, reject) => {
      resolve(returnValue)
    })
  }
}


Transactions.aggregate = function (query, callback) {

  const returnValue = [{balance : 5}]
  if (query && typeof query === "function" && callback == null) {
    query('', returnValue);
  } else if (callback != null && typeof callback === "function") {
    callback('', returnValue);
  } else {
    return new Promise((resolve, reject) => {
      resolve(returnValue)
    })
  }
}

Transactions.save = function () {
}

Transactions.update = function () {
}

Transactions.remove= function() {
}
  
module.exports.Transactions = Transactions;
