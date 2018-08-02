const sinon = require('sinon');
jest.mock('./gethConnect.js');
jest.mock('./dbServices.js');
jest.mock('../controllers/transactions_ctrl.js');
jest.mock('../controllers/assets_ctrl.js');
jest.mock('../utils/hashMaps.js')


describe('Test subscribeBlockHeaders function', () => {
  test('subscribeBlockHeaders function should call bcx.getBlockTx, dbCollections.ethTransactions.listDbZeroConfTx, dbCollections.ethTransactions.listPending dbCollections.ethTransactions.updateTxHistoryHeight, processTx.checkBlockTx and processTx.checkPendingTx thrice, and call dbServices.updateTxHistory once', (done) => {
    const dbCollections = require('./dbServices.js').dbCollections
    const spy4 = sinon.spy(dbCollections.transactions, 'updateTxHistoryHeight');
	  const stub5 = sinon.stub(dbCollections.assets, 'updateERC20SmartContractsHistoryHeight');
	  stub5.resolves();

	  const processTx = require('./processTx');
	  const stub1 = sinon.stub(processTx, 'checkPendingTx');
    stub1.resolves();



	  const gethSubscribe = require('./gethSubscribe.js');

	  return gethSubscribe.subscribeBlockHeaders()
      .then(() => {
        sinon.assert.callCount(spy4, 3);
        sinon.assert.callCount(stub1, 3);
        spy4.restore();
        stub1.restore();
        done();
      });
  });
});

describe('Test subscribePendingTx funtion', () => {
	test("subscribePendingTx function should call bcx.getTxInfo and processTx.newPendingTx once (because of a mocked 'new pending transaction' event being fired by web3 mock)", (done) => {
		const web3 = require('./gethConnect').web3;
		const bcx = require('./bcx.js');
		const processTx = require('./processTx');
		const stub1 = sinon.stub(bcx, 'getTxInfo');
		stub1.resolves(web3.transactions[0]);
		const stub2 = sinon.stub(processTx, 'newPendingTx');
		const gethSubscribe = require('./gethSubscribe.js');
		return gethSubscribe.subscribePendingTx()
		.then(() => {
			sinon.assert.callCount(stub1, web3.transactions.length);
			sinon.assert.callCount(stub2, web3.transactions.length);
			stub1.restore();
			stub2.restore();
			done();
		});
	});
});


describe('Test subscribeAllDBERC20SmartContracts function', () => {
	test('subscribeAllDBERC20SmartContracts Should call dbCollections.smartContracts.listAll() once and subscribeERC20SmartContract thrice', () => {
		const dbCollections = require('./dbServices.js').dbCollections
		const stub1 = sinon.stub(dbCollections.assets, 'listAll');
		stub1.resolves(['asset1', 'asset2', 'asset3']);

		const gethSubscribe = require('./gethSubscribe.js');
		const stub2 = sinon.stub(gethSubscribe, 'subscribeERC20SmartContract');
		stub2.resolves();


		return gethSubscribe.subscribeAllDBERC20SmartContracts()
		sinon.assert.callCount(stub2, 3);
		sinon.assert.calledOnce(stub1);
		stub1.restore();
		stub2.restore();
	});
});
