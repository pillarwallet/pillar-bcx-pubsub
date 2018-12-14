const accounts = require('../../controllers/__mocks__/accounts_ctrl.js');
const assets = require('../../controllers/__mocks__/assets_ctrl.js');
const transactions = require('../../controllers/__mocks__/transactions_ctrl.js');

module.exports.dbCollections = { accounts, assets, transactions };
module.exports.dbConnectDisplayAccounts = () => {};
module.exports.initDB = () => {};
module.exports.initDBTxHistory = () => {};
module.exports.initDBERC20SmartContracts = () => {};
module.exports.findTxHistoryHeight = () => {};
module.exports.listHistory = () => {};
module.exports.findERC20SmartContractsHistoryHeight = () => {};
module.exports.updateERC20SmartContractsHistoryHeight = () => {};
module.exports.addTransactionStats = () => { };