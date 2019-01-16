const accounts = require('../../controllers/__mocks__/accounts_ctrl.js');
const assets = require('../../controllers/__mocks__/assets_ctrl.js');
const transactions = require('../../controllers/__mocks__/transactions_ctrl.js');
const historicTransactions = require('../../controllers/__mocks__/historic_transactions_ctrl.js');

module.exports.dbCollections = { accounts, assets, transactions, historicTransactions };
module.exports.dbConnectDisplayAccounts = () => {};
module.exports.initDB = () => {};
module.exports.initDBTxHistory = () => {};
module.exports.initDBERC20SmartContracts = () => {};
module.exports.findTxHistoryHeight = () => {};
module.exports.listHistory = () => {};
module.exports.findERC20SmartContractsHistoryHeight = () => {};
module.exports.updateERC20SmartContractsHistoryHeight = () => {};
module.exports.addTransactionStats = () => { };
module.exports.listPending = function () {
    return new Promise((resolve, reject) => {
        resolve([{ txHash: "hash"}])
    })
}

module.exports.listAssets = function () {
    return new Promise((resolve, reject) => {
        resolve([{ txHash: "hash" }])
    })
}


module.exports.dbConnect = function () {
    return new Promise((resolve, reject) => {
        resolve([{ txHash: "hash" }])
    })
}

module.exports.recentAccounts = function () {
    return new Promise((resolve, reject) => {
        resolve([{ addresses: [{ protocol: 'Ethereum' }], txHash: "hash" }])
    })
}

module.exports.contractsToMonitor = function () {
    return new Promise((resolve, reject) => {
        resolve(true)
    })
}

module.exports.assetDetails = function () {
    return new Promise((resolve, reject) => {
        resolve([{ addresses: [{ protocol: 'Ethereum' }], txHash: "hash" }])
    })
}

module.exports.getAsset = function () {
    return new Promise((resolve, reject) => {
        resolve({ contractAddress: "AT"})
    })
}





