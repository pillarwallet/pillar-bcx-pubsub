const sinon = require('sinon');
jest.mock('./services/dbServices.js');
jest.mock('./services/gethConnect.js')

describe('Test init function ', () => {
	test('Expect init to call gethConnect.gethConnectDisplay, dbServices.dbConnectDisplayAccounts' +
		'dbServices.initDB, dbServices.initDBTxHistory and dbServices.initDBERC20SmartContracts', (done) => {

		const gethConnect = require('./services/gethConnect.js');
		const stub1 = sinon.stub(gethConnect, 'gethConnectDisplay');
		stub1.resolves();
		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices, 'dbConnectDisplayAccounts');
		stub2.resolves();
		const stub3 = sinon.stub(dbServices, 'initDB');
		stub3.resolves();
		const stub4 = sinon.stub(dbServices, 'initDBTxHistory');
		stub4.resolves();
		const stub5 = sinon.stub(dbServices, 'initDBERC20SmartContracts');
		stub5.resolves();

		const housekeeper = require('./housekeeper.js');
		return housekeeper.init()
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			sinon.assert.called(stub4);
			sinon.assert.called(stub5);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			stub5.restore();
			done();
		})
		});
	});


describe('Test recoverWallet function ', () => {
	test('Expect recoverWallet to call bcx.getPendingTxArray, dbServices.dbCollections.transactions.listDbZeroConfTx,' +
		'processTx.processNewPendingTxArray, bcx.getLastBlockNumber and dlTxHistory', (done) => {

		const bcx = require('./services/bcx.js');
		const stub1 = sinon.stub(bcx, 'getPendingTxArray');
		stub1.resolves([{ hash: 'hash' }]);
		const stub4 = sinon.stub(bcx, 'getLastBlockNumber');
		stub4.resolves(999);

		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices.dbCollections.transactions, 'listDbZeroConfTx');
		stub2.resolves([{ txHash: 'hash' }]);

		const processTx = require('./services/processTx.js');
		const stub3 = sinon.stub(processTx, 'processNewPendingTxArray');
		stub3.resolves(1);

		const housekeeper = require('./housekeeper.js');
		const stub5 = sinon.stub(housekeeper, 'dlTxHistory');
		stub5.resolves();

		return housekeeper.recoverWallet('recoverAddress', 15)
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			sinon.assert.called(stub4);
			sinon.assert.called(stub5);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			stub5.restore();
			done();
		})
	});
});

describe('Test checkTxPool function ', () => {
	test('Expect checkTxPool to call bcx.getPendingTxArray, dbServices.dbCollections.transactions.listDbZeroConfTx,' +
		' and processTx.processNewPendingTxArray', (done) => {

		const bcx = require('./services/bcx.js');
		const stub1 = sinon.stub(bcx, 'getPendingTxArray');
		stub1.resolves([{ hash: 'hash' }]);

		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices.dbCollections.transactions, 'listDbZeroConfTx');
		stub2.resolves([{ txHash: 'hash' }]);

		const processTx = require('./services/processTx.js');
		const stub3 = sinon.stub(processTx, 'processNewPendingTxArray');
		stub3.resolves(1);

		const housekeeper = require('./housekeeper.js');

		return housekeeper.checkTxPool('recoverAddress', 15)
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		})
	});
});


describe('Test updateTxHistory function ', () => {
	test('Expect updateTxHistory to call bcx.getLastBlockNumber, dbServices.dbCollections.transactions.findTxHistoryHeight' +
		'and dlTxHistory', (done) => {

		const bcx = require('./services/bcx.js');
		const stub1 = sinon.stub(bcx, 'getLastBlockNumber');
		stub1.resolves([999]);

		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices.dbCollections.transactions, 'findTxHistoryHeight');
		stub2.resolves([998]);

		const housekeeper = require('./housekeeper.js');
		const stub3 = sinon.stub(housekeeper, 'dlTxHistory');
		stub3.resolves(1);

		return housekeeper.updateTxHistory()
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		})
	});
});


describe('Test dlTxHistory function ', () => {
	test('Expect dlTxHistory to call bcx.getBlockTx, processTxHistory, dbServices.dbCollections.transactions.listHistory' +
		'processTx.checkPendingTx, dbServices.dbCollections.transactions.updateTxHistoryHeight', (done) => {

		const bcx = require('./services/bcx.js');
		const stub1 = sinon.stub(bcx, 'getBlockTx');
		stub1.resolves(['tx1', 'tx2']);


		const dbServices = require('./services/dbServices.js');
		const stub3 = sinon.stub(dbServices.dbCollections.transactions, 'listHistory');
		stub3.resolves(['tx1', 'tx2']);

		const processTx = require('./services/processTx.js');
		const stub4 = sinon.stub(processTx, 'checkPendingTx');
		stub4.resolves();

		const stub5 = sinon.stub(dbServices.dbCollections.transactions, 'updateTxHistoryHeight');
		stub5.resolves();

		const housekeeper = require('./housekeeper.js');
		const stub2 = sinon.stub(housekeeper, 'processTxHistory');
		stub2.resolves(1);

		return housekeeper.dlTxHistory(0, 1, 0)
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			sinon.assert.called(stub4);
			sinon.assert.called(stub5);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			stub5.restore();
			done();
		})
	});
});


describe('Test processTxHistory function ', () => {
	test('Expect processTxHistory to call processTx.newPendingTx, ', (done) => {

		const processTx = require('./services/processTx.js');
		const stub = sinon.stub(processTx, 'newPendingTx');
		stub.resolves();

		const housekeeper = require('./housekeeper.js');

		return housekeeper.processTxHistory(['tx1', 'tx2'], 0, 0)
		.then(() => {
			sinon.assert.called(stub);
			stub.restore();
			done();
		})
	});
});

describe('Test dlERC20SmartContracts function ', () => {
	test('Expect dlERC20SmartContracts to call gethConnect.web3.eth.getBlock, bcx.getBlockSmartContractsAddressesArray,' +
		'processSmartContractsAddressesArray and dbServices.dbCollections.assets.updateERC20SmartContractsHistoryHeight', (done) => {

		const gethConnect = require ('./services/gethConnect.js')
		const stub1 = sinon.stub(gethConnect.web3.eth, 'getBlock');
		stub1.resolves(999);

		const bcx = require('./services/bcx.js');
		const stub2 = sinon.stub(bcx, 'getBlockSmartContractsAddressesArray');
		stub2.resolves(['smaco1', 'smaco2']);


		const dbServices = require('./services/dbServices.js');
		const stub4 = sinon.stub(dbServices.dbCollections.assets, 'updateERC20SmartContractsHistoryHeight');
		stub4.resolves();


		const housekeeper = require('./housekeeper.js');
		const stub3 = sinon.stub(housekeeper, 'processSmartContractsAddressesArray');
		stub3.resolves(1);

		return housekeeper.dlERC20SmartContracts(0, 1, 0)
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			sinon.assert.called(stub4);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			done();
		})
	});
});


describe('Test processSmartContractsAddressesArray function ', () => {
	test('Expect processSmartContractsAddressesArray to call gethConnect.web3.eth.Contract, dbServices.dbCollections.assets.addContract and process.send', (done) => {

		const gethConnect = require ('./services/gethConnect.js')
		const spy = sinon.spy(gethConnect.web3.eth, 'Contract');


		const dbServices = require('./services/dbServices.js');
		const stub1 = sinon.stub(dbServices.dbCollections.assets, 'addContract');
		stub1.resolves();

		const stub2 = sinon.stub(process, 'send');
		stub2.resolves();

		const housekeeper = require('./housekeeper.js');

		return housekeeper.processSmartContractsAddressesArray(['smartContractAddress1'], 0, 0)
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(spy);
			stub1.restore();
			stub2.restore();
			spy.restore();
			done();
		})
	});
});

describe('Test updateERC20SmartContracts function ', () => {
	test('Expect updateERC20SmartContracts to call bcx.getLastBlockNumber, dbServices.dbCollections.assets.findERC20SmartContractsHistoryHeight,' +
		'and dlERC20SmartContracts', (done) => {

		const bcx = require ('./services/bcx.js')
		const stub1 = sinon.stub(bcx, 'getLastBlockNumber');
		stub1.resolves(999);

		const dbServices = require('./services/dbServices.js');
		const stub2 = sinon.stub(dbServices.dbCollections.assets, 'findERC20SmartContractsHistoryHeight');
		stub2.resolves(998);

		const housekeeper = require('./housekeeper.js');
		const stub3 = sinon.stub(housekeeper, 'dlERC20SmartContracts');
		stub3.resolves();

		return housekeeper.updateERC20SmartContracts()
		.then(() => {
			sinon.assert.called(stub1);
			sinon.assert.called(stub2);
			sinon.assert.called(stub3);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		})
	});
});
