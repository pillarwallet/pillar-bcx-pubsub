module.exports.getBlockTx = ()=>{
    return {
        transactions: [{ to: "to", from: "from", hash: "hash"}]
    }
}

module.exports.getTxReceipt = ()=>{ return new Promise((resolve, reject) => {
    resolve({ status: "0x1" })
})
}

module.exports.getPastEvents = () => {
    return {
        transactions: [{ to: "to", from: "from", hash: "hash" }]
    }
}

module.exports.getLastBlockNumber = () => {
    return 500
}

module.exports.getTransactionCountForWallet = () => {
    return 50
}

module.exports.getAllTransactionsForWallet =  () => {
    return [{result:{gasUsed:5}, action: { input: "input", to: "to", from: "from", hash: "hash"}, to: "to", from: "from", hash: "hash" }]
}



