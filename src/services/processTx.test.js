
const sinon = require('sinon');

describe('Test filterAddress function', () => {
	test("When a Pillar wallet address is passed and recoverAddress is passed as well and equals address," +
    " filterAddress should call dbServices.dbCollections.accounts.findByAddress once  and return " +
    "{'isPillarAddress' : true, 'pillarId': pillarId, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {

		jest.mock('./dbServices');
		const dbCollections = require('./dbServices.js').dbCollections;
		const spy = sinon.spy(dbCollections.accounts, 'findByAddress');
		const address = '0x81b7E08F65Bdf5648606c89998A9CC8164397647';
		const processTx = require('./processTx.js');

		return processTx.filterAddress(address, false, address)
		.then((result) => {
			expect(result).toEqual({ "ERC20SmartContractTicker": "", "isERC20SmartContract": false, "isPillarAddress": true, "pillarId": 'pillarId'});
			sinon.assert.calledOnce(spy);
			spy.restore();
			done();
		});
	});

  test("When a Pillar wallet address is passed and Publisher = false, filterAddress should call accounts.findByAddress once and NOT call assets.findByAddress" +
	  "  and return {'isPillarAddress' : true, 'pillarId': pillarId, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {
	  jest.mock('./dbServices');
	  const dbCollections = require('./dbServices.js').dbCollections;
	  const spy = sinon.spy(dbCollections.accounts, 'findByAddress');
	  const spy2 = sinon.spy(dbCollections.assets, 'findByAddress');
	  const address = '0x81b7E08F65Bdf5648606c89998A9CC8164397647';
	  const processTx = require('./processTx.js');

	  return processTx.filterAddress(address, false)
      .then((result) => {
        expect(result).toEqual({ 'isPillarAddress' : true, 'pillarId': 'pillarId', 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''});
	      sinon.assert.calledOnce(spy);
	      sinon.assert.notCalled(spy2);
	      spy.restore();
	      spy2.restore();
        done();
      });
  });

	test("When a smart contract address is passed and Publisher = false, filterAddress should call accounts.findByAddress once, assets.findByAddress once" +
		"  and return {'isPillarAddress' : true, 'pillarId': pillarId, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {
		jest.mock('./dbServices');
		const dbCollections = require('./dbServices.js').dbCollections;
		const spy = sinon.spy(dbCollections.accounts, 'findByAddress');
		const spy2 = sinon.spy(dbCollections.assets, 'findByAddress');
		const address = '0xd55ebfba026cf4c321d939dcd488394bb358ebf8'
		const processTx = require('./processTx.js');

		return processTx.filterAddress(address, false)
		.then((result) => {
			expect(result).toEqual({ 'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : true, 'ERC20SmartContractTicker': 'PLR'});
			sinon.assert.calledOnce(spy);
			sinon.assert.calledOnce(spy2);
			spy.restore();
			spy2.restore();
			done();
		});
	});

	test("When an unknown address is passed and Publisher = false, filterAddress should call accounts.findByAddress once, assets.findByAddress once" +
		"  and return {'isPillarAddress' : false, 'pillarId': '', 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': ''}", (done) => {
		jest.mock('./dbServices');
		const dbCollections = require('./dbServices.js').dbCollections;
		const spy = sinon.spy(dbCollections.accounts, 'findByAddress');
		const spy2 = sinon.spy(dbCollections.assets, 'findByAddress');
		jest.mock('web3');
		const processTx = require('./processTx.js');

		return processTx.filterAddress('OxUnknownAddress', false)
		.then((result) => {
			expect(result).toEqual({'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': null});
			sinon.assert.calledOnce(spy);
			sinon.assert.calledOnce(spy2);
			spy.restore();
			spy2.restore();
			done();
		});
	});

	test("When a Pillar wallet address is passed and Publisher = true, filterAddress should call hashMaps.accounts.has once and hashMaps.accounts.get once" +
		"  and return {'isPillarAddress' : true, 'pillarId': pillarId, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': null}", (done) => {
		const hashMaps = require('../utils/hashMaps.js');
		const stub = sinon.stub(hashMaps.accounts, 'has');
		stub.returns(true)
		const stub2 = sinon.stub(hashMaps.accounts, 'get');
		stub2.returns('pillarId')
		const address = '0x81b7E08F65Bdf5648606c89998A9CC8164397647';

		const processTx = require('./processTx.js');

		return processTx.filterAddress(address, true)
		.then((result) => {
			expect(result).toEqual({ 'isPillarAddress' : true, 'pillarId': 'pillarId', 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': null});
			sinon.assert.calledOnce(stub);
			sinon.assert.calledOnce(stub2);
			stub.restore();
			stub2.restore();
			done();
		});
	});

	test("When a smart contract address is passed and Publisher = true, filterAddress should call hashMaps.accounts.has once, hashMaps.assets.has once " +
		"and hashMaps.assets.get once and return {'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : true, 'ERC20SmartContractTicker': ticker}", (done) => {
		const hashMaps = require('../utils/hashMaps.js');
		const stub = sinon.stub(hashMaps.accounts, 'has');
		stub.returns(false)
		const stub2 = sinon.stub(hashMaps.assets, 'has');
		stub2.returns(true)
		// const stub3 = sinon.stub(hashMaps.assets, 'get'); // NOT IMPLEMENTED YET
		// stub3.returns('assetTicker')
		const address = '0x81b7E08F65Bdf5648606c89998A9CC8164397647';

		const processTx = require('./processTx.js');

		return processTx.filterAddress(address, true)
		.then((result) => {
			expect(result).toEqual({ 'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : true, 'ERC20SmartContractTicker': 'ticker'});
			sinon.assert.calledOnce(stub);
			sinon.assert.calledOnce(stub2);
			// sinon.assert.calledOnce(stub3);
			stub.restore();
			stub2.restore();
			// stub3.restore();
			done();
		});
	});

	test("When am unknown address is passed and Publisher = true, filterAddress should call hashMaps.accounts.has once, hashMaps.assets.has once " +
		"and return {'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': null}", (done) => {
		const hashMaps = require('../utils/hashMaps.js');
		const stub = sinon.stub(hashMaps.accounts, 'has');
		stub.returns(false)
		const stub2 = sinon.stub(hashMaps.assets, 'has');
		stub2.returns(false)

		const address = '0x81b7E08F65Bdf5648606c89998A9CC8164397647';

		const processTx = require('./processTx.js');

		return processTx.filterAddress(address, true)
		.then((result) => {
			expect(result).toEqual({ 'isPillarAddress' : false, 'pillarId': null, 'isERC20SmartContract' : false, 'ERC20SmartContractTicker': null });
			sinon.assert.calledOnce(stub);
			sinon.assert.calledOnce(stub2);
			stub.restore();
			stub2.restore();
			done();
		});
	});

});


describe('Test newPendingTx function', () => {
  test('When a transaction object involving 2 pillar addresses is passed and Publisher=true, newPendingTx should call ' +
	  'processTx.filterAddress twice and  call rmqServices.sendPubSubMessage twice', (done) => {
		jest.mock('web3')
	  const web3 = require('web3');
    const tx = web3.transactions[0];
	  const processTx = require('./processTx.js');
	  const stub1 = sinon.stub(processTx, 'filterAddress');
	  const rmqServices = require('./rmqServices.js');
	  const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
	  stub2.returns();

    stub1.onFirstCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

	  return processTx.newPendingTx(tx, true)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        sinon.assert.callCount(stub2,2);
        stub1.restore();
        stub2.restore();
        done();
      });
  });

	test('When a transaction object involving 2 pillar addresses is passed and Publisher=false, newPendingTx should call ' +
		'processTx.filterAddress twice and  call dbServices.dbCollections.transactions.addTx twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,2);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar address as the recipient is passed and Publisher=true, newPendingTx should call ' +
		'processTx.filterAddress twice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar addresses as the recipient is passed and Publisher=false, newPendingTx should call ' +
		'processTx.filterAddress twice and  call dbServices.dbCollections.transactions.addTx once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar address as the sender is passed and Publisher=true, newPendingTx should call ' +
		'processTx.filterAddress twice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar addresses as the sender is passed and Publisher=false, newPendingTx should call ' +
		'processTx.filterAddress twice and  call dbServices.dbCollections.transactions.addTx once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object NOT involving a pillar addresses is passed , newPendingTx should call ' +
		'processTx.filterAddress twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			stub1.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar address as the sender and an ERC20 smart contract as the recipient is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress twice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving 1 pillar addresses as the sender and an ERC20 smart contract as the recipient is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress twice and  call dbServices.dbCollections.transactions.addTx once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving an unknown address as the sender and an ERC20 smart contract as the recipient is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,0);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving an unknown addresses as the sender and an ERC20 smart contract as the recipient is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.transactions[0];
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });

		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,0);
			stub1.restore();
			stub2.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer from an unknown address to a pillar address is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress thrice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })


		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer from an unknown address to a pillar address is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress thrice and  call dbServices.dbCollections.transactions.addTx once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx =  web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer between two pillar addresses is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress thrice and  call rmqServices.sendPubSubMessage twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })


		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,2);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer between two pillar addresses is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress thrice and  call dbServices.dbCollections.transactions.addTx twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx =  web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,2);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer from a pillar address to an unknown address is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress thrice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })


		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a token transfer from a pillar address to an unknown address is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress thrice and  call dbServices.dbCollections.transactions.addTx twice', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx =  web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'transfer', params: [{ value: 'toAddress' }, { value: 100000000000 }] })

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		stub1.onThirdCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 3);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a zero-value contract call from a pillar address is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress twice and  call rmqServices.sendPubSubMessage once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'not a transfer'})


		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		// stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a zero-value contract call from a pillar address is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress twice and  call dbServices.dbCollections.transactions.addTx once', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx =  web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'not a transfer'})

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		// stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,1);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a zero-value contract call from an unknown address is passed ' +
		'and Publisher=true, newPendingTx should call processTx.filterAddress twice and  NOT call rmqServices.sendPubSubMessage', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx = web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		const rmqServices = require('./rmqServices.js');
		const stub2 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'not a transfer'})


		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		// stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, true)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,0);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});

	test('When a transaction object involving a zero-value contract call from an unknown address is passed ' +
		'and Publisher=false, newPendingTx should call processTx.filterAddress twice and NOT call dbServices.dbCollections.transactions.addTx', (done) => {
		jest.mock('web3')
		const web3 = require('web3');
		const tx =  web3.tokenTransfer;
		const processTx = require('./processTx.js');
		const stub1 = sinon.stub(processTx, 'filterAddress');
		jest.mock('./dbServices.js')
		const dbCollections = require('./dbServices.js').dbCollections;
		const stub2 = sinon.stub(dbCollections.transactions, 'addTx');
		stub2.returns();
		const abiDecoder = require('abi-decoder');
		const stub3 = sinon.stub(abiDecoder, 'decodeMethod');
		stub3.returns({ name: 'not a transfer'})

		stub1.onFirstCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: true, ERC20SmartContractTicker: '' });
		stub1.onSecondCall().resolves({ isPillarAddress: false, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });
		// stub1.onThirdCall().resolves({ isPillarAddress: true, pillarId: 'pillarId', isERC20SmartContract: false, ERC20SmartContractTicker: '' });


		return processTx.newPendingTx(tx, false)
		.then(() => {
			sinon.assert.callCount(stub1, 2);
			sinon.assert.callCount(stub2,0);
			sinon.assert.callCount(stub3,1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			done();
		});
	});
});

describe('Test checkPendingTx function', () => {
  test('When transaction has less than 1 block confirmations, checkPendingTx should call hashMaps.pendingTx.get once and  bcx.getTxInfo once ', (done) => {

	  const txObject = {
		  txHash: 'txHash',
	  }
	  const txInfo = {
		  blockNumber: null
	  }

    const hashMaps = require('../utils/hashMaps.js');
	  const stub1 = sinon.stub(hashMaps.pendingTx, 'get');
		stub1.returns(txObject)

    const bcx = require('./bcx.js');
    const stub2 = sinon.stub(bcx, 'getTxInfo');
    stub2.resolves(txInfo);

		const processTx = require('./processTx.js')

    return processTx.checkPendingTx(['pendingTxHash'], 9999999999)
        .then(() => {
          sinon.assert.callCount(stub1, 1);
          sinon.assert.callCount(stub2, 1);
          stub1.restore();
          stub2.restore();
	        done();
        });
  });


test('When transaction has more than 1 block confirmations and isPublisher = true, checkPendingTx should call hashMaps.pendingTx.get once,  bcx.getTxInfo once,' +
	'bcx.getTxReceipt once and rmqServices.sendPubSubMessage once', (done) => {

	const txObject = {
		txHash: 'txHash',
	}
	const txInfo = {
		blockNumber: 1,
		gas: 21000,
	}
	const txReceipt = {
		gasUsed: 21000,
	}

	const hashMaps = require('../utils/hashMaps.js');
	const stub1 = sinon.stub(hashMaps.pendingTx, 'get');
	stub1.returns(txObject)

	const bcx = require('./bcx.js');
	const stub2 = sinon.stub(bcx, 'getTxInfo');
	stub2.resolves(txInfo);

	const stub3 = sinon.stub(bcx, 'getTxReceipt');
	stub3.resolves(txReceipt);

	const rmqServices = require('./rmqServices.js')
	const stub4 = sinon.stub(rmqServices, 'sendPubSubMessage');
	stub4.returns();

	const processTx = require('./processTx.js')

	return processTx.checkPendingTx(['pendingTxHash'], 9999999999)
	.then(() => {
		sinon.assert.callCount(stub1, 1);
		sinon.assert.callCount(stub2, 1);
		sinon.assert.callCount(stub3, 1);
		sinon.assert.callCount(stub4, 1);
		stub1.restore();
		stub2.restore();
		stub3.restore();
		stub4.restore();
		done();
	});
});


	test('When transaction has more than 1 block confirmations and isPublisher = true and txReceipt is not found, checkPendingTx should call ' +
		'hashMaps.pendingTx.get once,  bcx.getTxInfo once, bcx.getTxReceipt once and rmqServices.sendPubSubMessage once', (done) => {

		const txObject = {
			txHash: 'txHash',
		}
		const txInfo = {
			blockNumber: 1,
			gas: 21000,
		}

		const hashMaps = require('../utils/hashMaps.js');
		const stub1 = sinon.stub(hashMaps.pendingTx, 'get');
		stub1.returns(txObject)

		const bcx = require('./bcx.js');
		const stub2 = sinon.stub(bcx, 'getTxInfo');
		stub2.resolves(txInfo);

		const stub3 = sinon.stub(bcx, 'getTxReceipt');
		stub3.resolves(null);

		const rmqServices = require('./rmqServices.js')
		const stub4 = sinon.stub(rmqServices, 'sendPubSubMessage');
		stub4.returns();

		const processTx = require('./processTx.js')

		return processTx.checkPendingTx(['pendingTxHash'], 9999999999)
		.then(() => {
			sinon.assert.callCount(stub1, 1);
			sinon.assert.callCount(stub2, 1);
			sinon.assert.callCount(stub3, 1);
			sinon.assert.callCount(stub4, 1);
			stub1.restore();
			stub2.restore();
			stub3.restore();
			stub4.restore();
			done();
		});
	});




test('When transaction has more than 1 block confirmations and isPublisher = true and gasUsed > gasLimit, checkPendingTx should call hashMaps.pendingTx.get once,  bcx.getTxInfo once,' +
	'bcx.getTxReceipt once and rmqServices.sendPubSubMessage once', (done) => {

	const txObject = {
		txHash: 'txHash',
	}
	const txInfo = {
		blockNumber: 1,
		gas: 21000,
	}
	const txReceipt = {
		gasUsed: 21001,
	}

	const hashMaps = require('../utils/hashMaps.js');
	const stub1 = sinon.stub(hashMaps.pendingTx, 'get');
	stub1.returns(txObject)

	const bcx = require('./bcx.js');
	const stub2 = sinon.stub(bcx, 'getTxInfo');
	stub2.resolves(txInfo);

	const stub3 = sinon.stub(bcx, 'getTxReceipt');
	stub3.resolves(txReceipt);

	const rmqServices = require('./rmqServices.js')
	const stub4 = sinon.stub(rmqServices, 'sendPubSubMessage');
	stub4.returns();

	const processTx = require('./processTx.js')

	return processTx.checkPendingTx(['pendingTxHash'], 9999999999)
	.then(() => {
		sinon.assert.callCount(stub1, 1);
		sinon.assert.callCount(stub2, 1);
		sinon.assert.callCount(stub3, 1);
		sinon.assert.callCount(stub4, 1);
		stub1.restore();
		stub2.restore();
		stub3.restore();
		stub4.restore();
		done();
	});
});

test('When transaction has more than 1 block confirmations and isPublisher = true and txInfo is not found, checkPendingTx should call hashMaps.pendingTx.get once,' +
	'  bcx.getTxInfo once, NOT call bcx.getTxReceipt  and call rmqServices.sendPubSubMessage once', (done) => {

	const txObject = {
		txHash: 'txHash',
	}
	const txInfo = {
		blockNumber: 1,
		gas: 21000,
	}
	const txReceipt = {
		gasUsed: 21001,
	}

	const hashMaps = require('../utils/hashMaps.js');
	const stub1 = sinon.stub(hashMaps.pendingTx, 'get');
	stub1.returns(txObject)

	const bcx = require('./bcx.js');
	const stub2 = sinon.stub(bcx, 'getTxInfo');
	stub2.resolves(null);

	const stub3 = sinon.stub(bcx, 'getTxReceipt');
	stub3.resolves(txReceipt);

	const rmqServices = require('./rmqServices.js')
	const stub4 = sinon.stub(rmqServices, 'sendPubSubMessage');
	stub4.returns();

	const processTx = require('./processTx.js')

	return processTx.checkPendingTx(['pendingTxHash'], 9999999999)
	.then(() => {
		sinon.assert.callCount(stub1, 1);
		sinon.assert.callCount(stub2, 1);
		sinon.assert.callCount(stub3, 0);
		sinon.assert.callCount(stub4, 1);
		stub1.restore();
		stub2.restore();
		stub3.restore();
		stub4.restore();
		done();
	});
});
});



describe('Test processNewPendingTxArray function', () => {
  test('Should call processTx.newPendingTx twice', (done) => {
    jest.mock('web3');
    const web3 = require('web3');
    jest.mock('abi-decoder');
    const abiDecoder = require('abi-decoder');
    jest.mock('../controllers/accounts_ctrl.js');
    const ethAddresses = require('../controllers/accounts_ctrl.js');
    jest.mock('../controllers/assets_ctrl.js');
    const smartContracts = require('../controllers/assets_ctrl.js');
    const tx = [web3.transactions[0], web3.transactions[1]];
    jest.mock('../controllers/transactions_ctrl.js');
    const ethTransactions = require('../controllers/transactions_ctrl.js');
    const dbCollections = { ethAddresses, smartContracts, ethTransactions };
	  const processTx = require('./processTx.js')

    const stub1 = sinon.stub(processTx, 'newPendingTx');
    stub1.resolves();


	  return processTx.processNewPendingTxArray(tx, 0)
      .then(() => {
        sinon.assert.callCount(stub1, 2);
        stub1.restore();
        done();
      });
  });
});



describe('Test checkTokenTransferEvent function', () => {
  test('When transfer event IS NOT a regular token transfer (asset=ETH) and recipient is a pillar address,' +
    ' checkTokenTransferEvent should call processTx.filterAddress once, dbCollections.ethTransactions.findByTxHash once,' +
    ' and rmqServices.sendPubSubMessage once', (done) => {

    const eventInfo = {
      value: 1000000000000000000,
      transactionHash: 'txHash',
      returnValues: {
        _to: 'toAddress',
        _from: 'fromAddress',
        _value: 999,
      },
    };
    const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };

    jest.mock('./dbServices.js')
    const dbCollections = require('./dbServices.js').dbCollections;

    const stub2 = sinon.stub(dbCollections.transactions, 'findByTxHash');
    stub2.resolves({
      tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'ETH',
    });

    const rmqServices = require('./rmqServices.js');
    const stub3 = sinon.stub(rmqServices, 'sendPubSubMessage');
    stub3.returns()

	  const processTx = require('./processTx.js')

	  const stub1 = sinon.stub(processTx, 'filterAddress');
	  stub1.resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });

    return processTx.checkTokenTransferEvent(eventInfo, ERC20SmartcContractInfo)
      .then(() => {
        sinon.assert.calledOnce(stub1);
        sinon.assert.calledOnce(stub2);
	      sinon.assert.calledOnce(stub3);
        stub1.restore();
        stub2.restore();
	      stub3.restore();
        done();
      });
  });

  test('When transfer event IS regular token transfer (asset!=ETH) to a Pillar address, checkTokenTransferEvent should call processTx.filterAddress once,' +
    '  call dbCollections.ethTransactions.findByTxHash once,  NOT call rmqServices.sendPubSubMessage', (done) => {
	  const eventInfo = {
		  value: 1000000000000000000,
		  transactionHash: 'txHash',
		  returnValues: {
			  _to: 'toAddress',
			  _from: 'fromAddress',
			  _value: 999,
		  },
	  };
	  const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };

	  jest.mock('./dbServices.js')
	  const dbCollections = require('./dbServices.js').dbCollections;

	  const stub2 = sinon.stub(dbCollections.transactions, 'findByTxHash');
	  stub2.resolves({
		  tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'PLR',
	  });

	  const rmqServices = require('./rmqServices.js');
	  const stub3 = sinon.stub(rmqServices, 'sendPubSubMessage');
	  stub3.returns()

	  const processTx = require('./processTx.js')

	  const stub1 = sinon.stub(processTx, 'filterAddress');
	  stub1.resolves({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });

	  return processTx.checkTokenTransferEvent(eventInfo, ERC20SmartcContractInfo)
	  .then(() => {
		  sinon.assert.calledOnce(stub1);
		  sinon.assert.calledOnce(stub2);
		  sinon.assert.notCalled(stub3);
		  stub1.restore();
		  stub2.restore();
		  stub3.restore();
		  done();
	  });
  });

  test('When recipient is not a pillar address, checkTokenTransferEvent should call processTx.filterAddress once,' +
	  ' NOT call dbCollections.ethTransactions.findByTxHash,  NOT call rmqServices.sendPubSubMessage', (done) => {
	  const eventInfo = {
		  value: 1000000000000000000,
		  transactionHash: 'txHash',
		  returnValues: {
			  _to: 'toAddress',
			  _from: 'fromAddress',
			  _value: 999,
		  },
	  };
	  const ERC20SmartcContractInfo = { address: 'address', symbol: 'symbol', decimals: 18 };

	  jest.mock('./dbServices.js')
	  const dbCollections = require('./dbServices.js').dbCollections;

	  const stub2 = sinon.stub(dbCollections.transactions, 'findByTxHash');
	  stub2.resolves({
		  tmstmp: 'tmstmp', nbConfirmations: 1, receipt: 'receipt', asset: 'ETH',
	  });

	  const rmqServices = require('./rmqServices.js');
	  const stub3 = sinon.stub(rmqServices, 'sendPubSubMessage');
	  stub3.returns()

	  const processTx = require('./processTx.js')

	  const stub1 = sinon.stub(processTx, 'filterAddress');
	  stub1.resolves({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });

	  return processTx.checkTokenTransferEvent(eventInfo, ERC20SmartcContractInfo)
	  .then(() => {
		  sinon.assert.calledOnce(stub1);
		  sinon.assert.notCalled(stub2);
		  sinon.assert.notCalled(stub3);
		  stub1.restore();
		  stub2.restore();
		  stub3.restore();
		  done();
	  });
  });
});


