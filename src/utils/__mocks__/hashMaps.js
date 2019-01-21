exports.assets = {
	values: () => {
		return ['asset1', 'asset2', 'asset3'];
	},
	get: (address) => {
		return {contractAddress: "0x33e9dd7bf74433d25fedc4e9465b08f63360c413da5bc53d6493e325e7ef3c7b", symbol: "ETH"}
	}
}

exports.accounts = {
		has: (address) => {
			if (address === '0x81b7E08F65Bdf5648606c89998A9CC8164397647'.toLowerCase()) {
				return true;
			} else {
				return false;
			}
		},
		get: () => {
			return 'pillarId';
		}
	}


exports.pendingTx = {
	get: () => {
		const txObject = {
			pillarId: 'pillarID',
			protocol: 'Ethereum',
			fromAddress: 'fromAddress',
			toAddress: 'toAddress',
			txHash: 'txHash',
			asset: 'asset',
			contractAddress: 'contractAddress',
			timestamp: 'tmstmp',
			blockNumber: 1,
			value: 0.76,
			status: 'pending',
			gasPrice: 4000000000,
			gasUsed: 21000,
		}
		return txObject;
	},
	keys: () => {
		return ['txHash1', 'txHash2'];
	}
}
