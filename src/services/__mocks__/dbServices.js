const accounts = require('../../controllers/__mocks__/accounts_ctrl.js');
const assets = require('../../controllers/__mocks__/assets_ctrl.js');
const transactions = require('../../controllers/__mocks__/transactions_ctrl.js');

exports.dbCollections = { accounts, assets, transactions };
exports.dbConnectDisplayAccounts = () => {};
exports.initDB = () => {};
exports.initDBTxHistory = () => {};
exports.initDBERC20SmartContracts = () => {};
exports.findTxHistoryHeight = () => {};
exports.listHistory = () => {};
exports.findERC20SmartContractsHistoryHeight = () => {};
exports.updateERC20SmartContractsHistoryHeight = () => {};
