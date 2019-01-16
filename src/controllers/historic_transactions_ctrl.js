const historicTransactions = require('../models/historic_transactions_model');


function addMultipleTx(txObject) {
    return new Promise((resolve, reject) => {
        try {
            historicTransactions.insert(txObject).then(function (mongooseDocuments) {
               resolve()
            })
            .catch(function (err) {
                reject(err)
            });
        } catch (e) { reject(e); }
    });
}
module.exports.addMultipleTx = addMultipleTx;