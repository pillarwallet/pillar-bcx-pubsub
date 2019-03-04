/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const blockNumber = 2461146;

const txHash =
  '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b';

const txObject = {
  blockHash:
    '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
  blockNumber: 2461146,
  from: '0xdc8F20170C0946ACCF9627b3EB1513CFD1c0499f',
  gas: 399795,
  gasPrice: '20000000000',
  hash: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
  input:
    '0x27dc297e731192a115f5e33877daae1fa9ef2507dd1752ca99d4d032c5f6773870771db60000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000731333836342e3000000000000000000000000000000000000000000000000000',
  nonce: 82055,
  to: '0x39aDa2EdF9Bda495Fce0278c7a66331cDfFDbEc1',
  transactionIndex: 14,
  value: '0',
  v: '0x1b',
  r: '0xb301428c3c38200d0d4c0604980cc25dfa11dad4f05c08d0c5a0987984a9ebf2',
  s: '0x65a02305bdc1f57563cf14a44983db03c2c3e7a8381a8355da11e5972604f8f4',
};

const transactions = [
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0x06e8511b535abcffd4e715429358540a0e2b94ca4b9f1c67a58c42868193138a',
    input: '0x',
    nonce: 1243024,
    to: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583',
    transactionIndex: 0,
    value: '1000000000000000000',
    v: '0x1b',
    r: '0x2ddcfd04d0b8981282b78492e31a682da493b16a1352b37299ee9e82bb375a9',
    s: '0x219990f145beba06660a1563ad9c6ed91c5b88b80134554e1ac458ace9484f4b',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0x10b01e7af83a2d2e97f649eaec6d2590d3ac06f0834d226bab83dc1f01874b52',
    input: '0x',
    nonce: 1243025,
    to: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C',
    transactionIndex: 1,
    value: '1000000000000000000',
    v: '0x1b',
    r: '0xef527a17bb1d1a110b7c09efdb645273fb4db6527b4b08d210e8a2855986b99b',
    s: '0x73a1a3e47d4c13b288c74f138feeeca3878b13a553c74ca4d8dfa7279358743e',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0x6f298f0a65077269cb30c95af525800c5840d080725dc47fad16d9d3d5810bfb',
    input: '0x',
    nonce: 1243026,
    to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
    transactionIndex: 2,
    value: '1000000000000000000',
    v: '0x1c',
    r: '0x74d43f34de8623341c9521ee88d67bfb75eeaba840ecd5de337561fa23128e4b',
    s: '0x6d6a96c26fda642ce427d93378b982f00ce0ebb5b1ab2ed8c1d499890f98a709',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0x28922ddaee50753861665f95d733f8874b0184be3200cabb181c8d6a5117a9b5',
    input: '0x',
    nonce: 1243027,
    to: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583',
    transactionIndex: 3,
    value: '1000000000000000000',
    v: '0x1c',
    r: '0x8a984f2979af41486b2bd6e66ef94106ead5cf26328df18803417fcfcb307e4f',
    s: '0x492f7f61587016e0a5be8a5d2bef072e6ad80d8aa4673536457ed01f333ac17',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0xa3dd4df4f2607dc40a834974e5bade5390a9d534e708c77597425c1c07ce3d2f',
    input: '0x',
    nonce: 1243028,
    to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
    transactionIndex: 4,
    value: '1000000000000000000',
    v: '0x1c',
    r: '0xae4c4e713ed8c91ce17464c5f469d3863506d8c2e13aa3666acf50f2d4060304',
    s: '0x29e4acd18c60db4fcc85407433aa34299c1b08bd0149da8cfe3e79a833c2a26',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0xf2eae2581634cc2a81f4ff616d4359da8dbe8a1c52e655b3f768cf3e79a9f046',
    input: '0x',
    nonce: 1243029,
    to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
    transactionIndex: 5,
    value: '1000000000000000000',
    v: '0x1b',
    r: '0x808fcd6f1ae1c1174e3f7029a606afb19282b4c777a211c6d7b89c81dbb6447f',
    s: '0x241da3750d61672f9321e9b08f537bad14658ccf223c72b3c5893b2eefe925f4',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
    gas: 21000,
    gasPrice: '120000000000',
    hash: '0x21d94e9283b30814acd0090d5c3807e8ea97af596f444244206edc7ca7229827',
    input: '0x',
    nonce: 1243030,
    to: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795',
    transactionIndex: 6,
    value: '1000000000000000000',
    v: '0x1c',
    r: '0x9cd27b632419a43d6fbb2af269b4614b14a5d4a41fe686974ce8d5670518d0e',
    s: '0x5f51692a56bfc59af7db0ec6e0b8970d4f5c5e73893322452e6bbd3ec841ca42',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x1781BD8BB7C48DE5C77650bF0795328ba41DC46e',
    gas: 100000,
    gasPrice: '120000000000',
    hash: '0x5729da867a214fbccee5ebeb06ad420a763267e079a2402cd23d2bd665e42e54',
    input:
      '0x40c10f19000000000000000000000000b660b10a922815667f0303576750fdbc6943e44a0000000000000000000000000000000000000000000000000000000000000fa0',
    nonce: 468,
    to: '0x2448D0bc24948960f2AFf3149D5F80f589936cFD',
    transactionIndex: 7,
    value: '0',
    v: '0x2a',
    r: '0x9024feb269aa6b8481b892e9657e2719d8154e13f2f5ee1e25eba0c15665a82d',
    s: '0x4618752f11068ab37f7997bdcc086e46ddac8420205bd1d2fa7947badd68537',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x74aaB2C8Bc665C684126f1ab49Fe98EF22974eFD',
    gas: 1369536,
    gasPrice: '100000000000',
    hash: '0x99c3044842322f4629d58fe36f7f7905a09435fbfe594827208827c812ff4102',
    input:
      '0x6060604052341561000f57600080fd5b6008600a0a62b71b00026000819055506008600a0a62b71b0002600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff1660007fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6000546040518082815260200191505060405180910390a361128b806100cd6000396000f3006060604052600436106100c5576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100ca578063095ea7b31461015857806318160ddd146101b257806323b872dd146101db5780632ff2e9dc14610254578063313ce5671461027d57806342966c68146102a657806366188463146102e157806370a082311461033b57806395d89b4114610388578063a9059cbb14610416578063d73dd62314610470578063dd62ed3e146104ca575b600080fd5b34156100d557600080fd5b6100dd610536565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561011d578082015181840152602081019050610102565b50505050905090810190601f16801561014a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561016357600080fd5b610198600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190505061056f565b604051808215151515815260200191505060405180910390f35b34156101bd57600080fd5b6101c5610661565b6040518082815260200191505060405180910390f35b34156101e657600080fd5b61023a600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610667565b604051808215151515815260200191505060405180910390f35b341561025f57600080fd5b610267610953565b6040518082815260200191505060405180910390f35b341561028857600080fd5b610290610960565b6040518082815260200191505060405180910390f35b34156102b157600080fd5b6102c76004808035906020019091905050610965565b604051808215151515815260200191505060405180910390f35b34156102ec57600080fd5b610321600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610abc565b604051808215151515815260200191505060405180910390f35b341561034657600080fd5b610372600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610d4d565b6040518082815260200191505060405180910390f35b341561039357600080fd5b61039b610d96565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103db5780820151818401526020810190506103c0565b50505050905090810190601f1680156104085780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561042157600080fd5b610456600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610dcf565b604051808215151515815260200191505060405180910390f35b341561047b57600080fd5b6104b0600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610fa5565b604051808215151515815260200191505060405180910390f35b34156104d557600080fd5b610520600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506111a1565b6040518082815260200191505060405180910390f35b6040805190810160405280600e81526020017f56656c6f6369747920546f6b656e00000000000000000000000000000000000081525081565b600081600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b60005481565b600080600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141515156106a657600080fd5b600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905061077783600160008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461122890919063ffffffff16565b600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061080c83600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461124190919063ffffffff16565b600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610862838261122890919063ffffffff16565b600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef856040518082815260200191505060405180910390a360019150509392505050565b6008600a0a62b71b000281565b600881565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482111515156109b557600080fd5b610a0782600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461122890919063ffffffff16565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610a5f8260005461122890919063ffffffff16565b6000819055503373ffffffffffffffffffffffffffffffffffffffff167f919f7e2092ffcc9d09f599be18d8152860b0c054df788a33bc549cdd9d0f15b1836040518082815260200191505060405180910390a260019050919050565b600080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905080831115610bcd576000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610c61565b610be0838261122890919063ffffffff16565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546040518082815260200191505060405180910390a3600191505092915050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6040805190810160405280600381526020017f56544e000000000000000000000000000000000000000000000000000000000081525081565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614151515610e0c57600080fd5b610e5e82600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461122890919063ffffffff16565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610ef382600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461124190919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905092915050565b600061103682600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461124190919063ffffffff16565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546040518082815260200191505060405180910390a36001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600082821115151561123657fe5b818303905092915050565b600080828401905083811015151561125557fe5b80915050929150505600a165627a7a723058203bc53dfc9021f1bc9ddbf4ecd4bda21284116df7a9ab6200a1ca4f727d2e8f980029',
    nonce: 3,
    to: null,
    transactionIndex: 8,
    value: '0',
    v: '0x2a',
    r: '0xa0d3b8fa633c4b2240eca7bf024cef12ff297683e64be65c90370b4288945ecc',
    s: '0x73bca40e39cd58de14cba9273b2356c88df38e4f5803f4804d14eb247ef17c0c',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x8Ba9Ce692a4142c2E21D56100C9FA45EeC4946a6',
    gas: 60000,
    gasPrice: '40000000000',
    hash: '0x8f7a209883f66b9198b94847b8017dc9eeb0914b30a22d193fe18b5619c45bf9',
    input: '0x',
    nonce: 1246,
    to: '0x24E2D404497212536efD0b1417adad11826c5a5f',
    transactionIndex: 9,
    value: '10000000000000000',
    v: '0x1c',
    r: '0x3fe6c1f37b7e8e41e841e269691ec2b7fa16e95ad3a02b6537b512ab4f06cbe8',
    s: '0x1ac4d94d542b86e53bcfc64aedc0e65ba8c89c2eeac67a467bf2aa719541ccf3',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0xDacC9C61754a0C4616FC5323dC946e89Eb272302',
    gas: 600000,
    gasPrice: '40000000000',
    hash: '0x2886bb308fbd7645ff980412c586ded48d55865b7b82134e6375390fbc201b3e',
    input:
      '0xf025caaf000000000000000000000000000000000000000000000000000000000000051a',
    nonce: 38012,
    to: '0x27AF1B9c0490a8D656FfA32a7E56B85CDF211eA8',
    transactionIndex: 10,
    value: '0',
    v: '0x1c',
    r: '0x591858ed7164f54e3efd6faef408ddcf6ffe40a286fcc98e9a14f9e71655b374',
    s: '0x8d002c0cd28564a9b26e05d3158a5f0174fd4962714f7cfbeca9a2a2212046a',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0xdDd0C029506dA567afB38f50Ce6BF8e07716FceF',
    gas: 21000,
    gasPrice: '30000000000',
    hash: '0x656eb3587a77743b38216296d2f85e95f15cb9b697f079f9ab72064f6d5ceca8',
    input: '0x',
    nonce: 32481,
    to: '0x555Ee11FBDDc0E49A9bAB358A8941AD95fFDB48f',
    transactionIndex: 11,
    value: '8999370000000000000',
    v: '0x29',
    r: '0x62bbca27dc6ad4819d5494259367bef07b9c93d62f5bfe74d9636b18e8ed89b9',
    s: '0x7dd4690275720541be3b615b63d7f2a34cbd199f0914e03ddc29e326730b1429',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0xdDd0C029506dA567afB38f50Ce6BF8e07716FceF',
    gas: 21000,
    gasPrice: '40000000000',
    hash: '0xb8672964a647c4e1fa1efa710f20ff5ed55cfba12df461c59592d068f3e1b7f6',
    input: '0x',
    nonce: 32482,
    to: '0x555Ee11FBDDc0E49A9bAB358A8941AD95fFDB48f',
    transactionIndex: 12,
    value: '999160000000000000',
    v: '0x2a',
    r: '0x8173a47c2d8110bd8cd8bc4bf3ab4ad8f4d7cdcb10c4e2d6b8038774f7cea3fb',
    s: '0x5f92922cd3f987e9b74507da850a7bec6d0933b712f0894f1dd6ae885b0a3d79',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0x4938f0D4fE7826657230d94381FF8809dfECD340',
    gas: 2000000,
    gasPrice: '20000000000',
    hash: '0x754d5d69e27731c1ab792024a998f97d7b0213fce5b989110047c7acd1d8780c',
    input:
      '0x40c10f19000000000000000000000000e0cc88ff140e334d73eb82ddee09323a98d4f7d900000000000000000000000000000000000000000000000000000000000000c8',
    nonce: 235,
    to: '0x3d722fbC0c93ADbB165C452F1F799171B85e9822',
    transactionIndex: 13,
    value: '0',
    v: '0x1b',
    r: '0xf2167b12db97ef45f76167085c83ea9b7f1e7b31158faa9e6809dc01a378472d',
    s: '0x38196c2a11d536a4f8497b53ea58d7981129a1dc807c5b3e4ec59f4b3c6b6bbe',
  },
  {
    blockHash:
      '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
    blockNumber: 2461146,
    from: '0xdc8F20170C0946ACCF9627b3EB1513CFD1c0499f',
    gas: 399795,
    gasPrice: '20000000000',
    hash: '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
    input:
      '0x27dc297e731192a115f5e33877daae1fa9ef2507dd1752ca99d4d032c5f6773870771db60000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000731333836342e3000000000000000000000000000000000000000000000000000',
    nonce: 82055,
    to: '0x39aDa2EdF9Bda495Fce0278c7a66331cDfFDbEc1',
    transactionIndex: 14,
    value: '0',
    v: '0x1b',
    r: '0xb301428c3c38200d0d4c0604980cc25dfa11dad4f05c08d0c5a0987984a9ebf2',
    s: '0x65a02305bdc1f57563cf14a44983db03c2c3e7a8381a8355da11e5972604f8f4',
  },
];

const txReceipt = {
  blockHash:
    '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
  blockNumber: 2461146,
  contractAddress: 'contractAddress',
  cumulativeGasUsed: 1944627,
  from: '0xdc8f20170c0946accf9627b3eb1513cfd1c0499f',
  gasUsed: 261731,
  logs: [
    {
      address: '0x39aDa2EdF9Bda495Fce0278c7a66331cDfFDbEc1',
      topics: [Array],
      data:
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000354f7261636c697a65207175657279207761732073656e742c207374616e64696e6720627920666f722074686520616e737765722e2e0000000000000000000000',
      blockNumber: 2461146,
      transactionHash:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
      transactionIndex: 14,
      blockHash:
        '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      logIndex: 5,
      removed: false,
      id: 'log_20087ee0',
    },
    {
      address: '0xCBf1735Aad8C4B337903cD44b419eFE6538aaB40',
      topics: [Array],
      data:
        '0x00000000000000000000000039ada2edf9bda495fce0278c7a66331cdffdbec1bf55a0002fc44c8aef27c26a7e88a5ecf6b51a6813b806ce0e289a1112fac3a600000000000000000000000000000000000000000000000000000000000038400000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000619b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000355524c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000426a736f6e2868747470733a2f2f6170692e636f696e6d61726b65746361702e636f6d2f76312f7469636b65722f626974636f696e2f292e302e70726963655f757364000000000000000000000000000000000000000000000000000000000000',
      blockNumber: 2461146,
      transactionHash:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
      transactionIndex: 14,
      blockHash:
        '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      logIndex: 6,
      removed: false,
      id: 'log_b5fb979b',
    },
    {
      address: '0x39aDa2EdF9Bda495Fce0278c7a66331cDfFDbEc1',
      topics: [Array],
      data:
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000354f7261636c697a65207175657279207761732073656e742c207374616e64696e6720627920666f722074686520616e737765722e2e0000000000000000000000',
      blockNumber: 2461146,
      transactionHash:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
      transactionIndex: 14,
      blockHash:
        '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      logIndex: 7,
      removed: false,
      id: 'log_51e7d5cc',
    },
    {
      address: '0xCBf1735Aad8C4B337903cD44b419eFE6538aaB40',
      topics: [Array],
      data:
        '0x00000000000000000000000039ada2edf9bda495fce0278c7a66331cdffdbec1c6c57cf171dee64e55116191f0de9570b069a63d2b97690d6b4c656718e3387b0000000000000000000000000000000000000000000000000000000000000e100000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000619b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000355524c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      blockNumber: 2461146,
      transactionHash:
        '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
      transactionIndex: 14,
      blockHash:
        '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
      logIndex: 8,
      removed: false,
      id: 'log_d76578da',
    },
  ],
  logsBloom:
    '0x00000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000008000000000000000000000000000000000000000000000000000000000000000000008000000020000000000000080000000202800000',
  status: '0x1',
  to: '0x39ada2edf9bda495fce0278c7a66331cdffdbec1',
  transactionHash:
    '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b',
  transactionIndex: 14,
};

function emitBlock(emitter, index) {
  emitter.emit('data', {
    number: module.exports.transactions[index].blockNumber,
    hash: module.exports.transactions[index].blockHash,
  });
}

const eth = {
  call(callParams, callback) {
    const properCallParams = {
      to: '0xSmartContractAddress',
      data: '0x70a08231000000000000000000000000address',
    };
    if (JSON.stringify(callParams) === JSON.stringify(properCallParams)) {
      callback('', 1000000000000000000);
    } else {
      callback('error');
    }
  },

  subscribe(subscribtion) {
    return {
      on(algo, callback) {
        if (subscribtion !== 'newBlockHeaders') {
          callback(txHash);
        } else {
          callback({
            number: module.exports.transactions[0].blockNumber,
            hash: module.exports.transactions[0].blockHash,
          });
        }
        return {
          on() {},
        };
      },
    };
  },
  getBlockTransactionCount() {
    return new Promise(resolve => {
      resolve(5);
    });
  },
  isSyncing() {
    return false;
  },

  getBlock(blockNumberOrHash, $returnTransactionObjects = false) {
    return new Promise((resolve, reject) => {
      try {
        let tx;
        if ($returnTransactionObjects) {
          tx = module.exports.transactions;
        } else {
          const txHashesArray = [];
          module.exports.transactions.forEach(txn => {
            txHashesArray.push(txn.hash);
          });
          tx = txHashesArray;
        }

        const blockObject = {
          number: 2461146,
          hash:
            '0x1182ce9f5e30c963bd876a2373ece2c5c60711c626a7e3574c4c511dac05d6bd',
          parentHash:
            '0xbc7af3e4eb34c19f7aeb6d040084076b2b610e4818692ac39fd140e4620019c4',
          nonce: '0xaf4802b00993b63d',
          sha3Uncles:
            '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          logsBloom:
            '0x00000000000000000000000000000000000000000000100100000000000000000000000000000000000000080000000000040000000008000000000000000000000000000020000000000008000000000000000000000000000000000000000000000000020000000001040000000800000000000000400100008010000000800000100000000000000000000800000000000128000000002000000000000000000080000000000000000000000000000000000000000000004000000000000000000002020000000008200000200000000000000000000010000000080020000010000000000000000000008000000020000000000000080000000202800000',
          transactionsRoot:
            '0x80f766cb5d3ba068dc62647772b880beb5fe232daf7292e4bb83ecbf3098139f',
          stateRoot:
            '0xfb8252cb4bacbef246d5b0436c028d06e9f52efbce82621d83bd5be2b7f0b4a4',
          miner: '0xD049bfd667cB46Aa3Ef5Df0dA3e57DB3Be39E511',
          difficulty: '2975666092',
          totalDifficulty: '7495574361293090',
          extraData: '0xd783010703846765746887676f312e392e32856c696e7578',
          size: 7435,
          gasLimit: 4712388,
          gasUsed: 1944627,
          timestamp: 1516028907,
          transactions: tx,
          uncles: [],
        };
        resolve(blockObject);
      } catch (e) {
        reject(e);
      }
    });
  },

  getTransaction(txHashParam) {
    return new Promise((resolve, reject) => {
      try {
        if (
          txHashParam ===
          '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b'
        ) {
          resolve(module.exports.txObject);
        } else {
          reject(new Error('Not A Tx Hash'));
        }
      } catch (e) {
        reject(e);
      }
    });
  },

  getBlockNumber() {
    return new Promise((resolve, reject) => {
      try {
        resolve(module.exports.blockNumber);
      } catch (e) {
        reject(e);
      }
    });
  },

  getTransactionReceipt(txHashParam) {
    return new Promise((resolve, reject) => {
      try {
        if (
          txHashParam ===
          '0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b'
        ) {
          resolve(module.exports.txReceipt);
        } else {
          reject(new Error('Not A Tx Hash'));
        }
      } catch (e) {
        reject(e);
      }
    });
  },

  getBalance() {
    return new Promise((resolve, reject) => {
      try {
        resolve(100000000000000000);
      } catch (e) {
        reject(e);
      }
    });
  },

  Contract: class Contract {
    get events() {
      return {
        Transfer(algo, callback) {
          callback(false, txObject);
        },
      };
    }

    get getPastEvents() {
      return () =>
        new Promise((resolve, reject) => {
          try {
            resolve([
              {
                returnValues: {
                  _to: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
                  _from: '0x81b7E08F65Bdf5648606c89998A9CC8164397647',
                },
              },
            ]);
          } catch (e) {
            reject(e);
          }
        });
    }

    get methods() {
      return {
        symbol: () => ({ call: () => {} }),
        name: () => ({ call: () => {} }),
        decimals: () => ({ call: () => {} }),
        totalSupply: () => ({ call: () => {} }),
      };
    }
  },
};

const providers = {
  WebsocketProvider: class WebsocketProvider {},
  HttpProvider: class HttpProvider {},
};

const method = class Method {};

const ex = function exs() {};

ex.Method = method;

const toChecksumAddress = () => '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d';

const isAddress = () => true;

class Web3 {
  static get providers() {
    return providers;
  }

  get _provider() {
    return {
      on: () => {},
    };
  }

  get extend() {
    return ex;
  }

  get trace() {
    return {
      filter: () =>
        new Promise(resolve => {
          resolve({ concat: () => {} });
        }),
    };
  }

  get utils() {
    return {
      toChecksumAddress,
      isAddress,
    };
  }
  get eth() {
    return eth;
  }

  setProvider() {
    return true;
  }

  sha3() {
    return '0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b';
  }
}

module.exports = Web3;

module.exports.transactions = transactions;
module.exports.txObject = txObject;
module.exports.txReceipt = txReceipt;
module.exports.blockNumber = blockNumber;
module.exports.emitBlock = emitBlock;
module.exports.txHash = txHash;
module.exports.getBlockNumber = eth.getBlockNumber;
