

describe('Deferred unit tests', () => {

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeAll(() => {
        jest.restoreAllMocks();
    });

    describe('The recoverAll function tests', () => {

        it('should have been called', done => {
            jest.mock('./ethService.js');
            jest.mock('./dbServices.js')
            const ethService = require('./ethService.js')
            const dbServices = require('./dbServices.js')
            const getAllTransactionsForWalletMock = jest.spyOn(ethService, 'getAllTransactionsForWallet');
            const ret = [
                {
                    "action": {
                        "from": "0xaad0bb0dffaef8c2b0c07dc9ba9603083e8be1f5",
                        "gas": "0x462534",
                        "init": "0x6060604052341561000f57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102db8061005e6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100a05780638da5cb5b146100c9578063fdacd5761461011e575b600080fd5b341561007257600080fd5b61009e600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610141565b005b34156100ab57600080fd5b6100b3610224565b6040518082815260200191505060405180910390f35b34156100d457600080fd5b6100dc61022a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561012957600080fd5b61013f600480803590602001909190505061024f565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610220578190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b151561020b57600080fd5b6102c65a03f1151561021c57600080fd5b5050505b5050565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102ac57806001819055505b505600a165627a7a72305820d5020201eddd6358d3954e967e37f65e56bc3602ef68fa8049a022785e9b09440029",
                        "value": "0x0"
                    },
                    "blockHash": "0x31ec947ac16bdba58842e6f712ae6a50651baa0721c274415fd19d5923aecfb5",
                    "blockNumber": 3068185,
                    "result": {
                        "address": "0x794450cf686d4f849f0e3354b59c0e9f882e30a9",
                        "code": "0x606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630900f01014610067578063445df0ac146100a05780638da5cb5b146100c9578063fdacd5761461011e575b600080fd5b341561007257600080fd5b61009e600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610141565b005b34156100ab57600080fd5b6100b3610224565b6040518082815260200191505060405180910390f35b34156100d457600080fd5b6100dc61022a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561012957600080fd5b61013f600480803590602001909190505061024f565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610220578190508073ffffffffffffffffffffffffffffffffffffffff1663fdacd5766001546040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050600060405180830381600087803b151561020b57600080fd5b6102c65a03f1151561021c57600080fd5b5050505b5050565b60015481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102ac57806001819055505b505600a165627a7a72305820d5020201eddd6358d3954e967e37f65e56bc3602ef68fa8049a022785e9b09440029",
                        "gasUsed": "0x28afb"
                    },
                    "subtraces": 0,
                    "traceAddress": [],
                    "transactionHash": "0x6a111e8966a097a726b35312e5eb251452f3436bae1ca3441de69c11e9106cb7",
                    "transactionPosition": 0,
                    "type": "create"
                },
                {
                    "action": {
                        "callType": "call",
                        "from": "0x3ca49055437286949a1ceb0070de85b05635b58e",
                        "gas": "0x414608",
                        "input": "0x937f6e77000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000073535353537373700000000000000000000000000000000000000000000000000",
                        "to": "0x5491042e8304c3121963169311b1cb6d08159384",
                        "value": "0x0"
                    },
                    "blockHash": "0x31ec947ac16bdba58842e6f712ae6a50651baa0721c274415fd19d5923aecfb5",
                    "blockNumber": 3068185,
                    "result": {
                        "gasUsed": "0x2aad",
                        "output": "0x"
                    },
                    "subtraces": 0,
                    "traceAddress": [],
                    "transactionHash": "0x11ee74a6271e4fb7cac9f4eb25cf477ab51e411c2545c6e33c47eb87013a1689",
                    "transactionPosition": 1,
                    "type": "call"
                },
                {
                    "action": {
                        "callType": "call",
                        "from": "0x7ab1ff6992746952cad1d2c1112e0a0bed3f3c3a",
                        "gas": "0x3cb368",
                        "input": "0xcf7e06cb0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                        "to": "0x104759bdd7f61c51e29697fbe1225128005d835b",
                        "value": "0x0"
                    },
                    "blockHash": "0x31ec947ac16bdba58842e6f712ae6a50651baa0721c274415fd19d5923aecfb5",
                    "blockNumber": 3068185,
                    "result": {
                        "gasUsed": "0x4f9",
                        "output": "0x"
                    },
                    "subtraces": 0,
                    "traceAddress": [],
                    "transactionHash": "0x4b9c29aaf684c07c5263396fe4a8f820807f614b664c2e461ab526b9eca748b1",
                    "transactionPosition": 2,
                    "type": "call"
                },
                {
                    "action": {
                        "callType": "call",
                        "from": "0x0b91619fe350e58b93c30382204518419c290ffc",
                        "gas": "0x414908",
                        "input": "0x88c2a0bf000000000000000000000000000000000000000000000000000000000000000a",
                        "to": "0xa817a179cbd9c27665a163a959383f89459f5425",
                        "value": "0x0"
                    },
                    "blockHash": "0x31ec947ac16bdba58842e6f712ae6a50651baa0721c274415fd19d5923aecfb5",
                    "blockNumber": 3068185,
                    "error": "Reverted",
                    "subtraces": 0,
                    "traceAddress": [],
                    "transactionHash": "0x3902faf349ce773db10e8239245cdcb374592707ec88e170a75f785d49698c68",
                    "transactionPosition": 3,
                    "type": "call"
                }
            ]

            getAllTransactionsForWalletMock.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve(ret)
                });
            });

            const addMultipleTxMock = jest.spyOn(dbServices.dbCollections.historicTransactions, 'addMultipleTx');

            addMultipleTxMock.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    done(); resolve()
                });
            });


            const deferred = require('./deferred.js')
            deferred.saveDefferedTransactions()
        });
    });

});