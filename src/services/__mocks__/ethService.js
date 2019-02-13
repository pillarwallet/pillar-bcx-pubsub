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
module.exports.getBlockTx = ()=>{
    return {
        transactions: [{ to: "to", from: "from", hash: "hash"}]
    }
}

module.exports.getBlockTxRPC = () => {
    return {
        transactions: [{ to: "to", from: "from", hash: "hash" }]
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
    return new Promise((resolve, reject) => {
     resolve(500)
    })
}

module.exports.getTransactionCountForWallet = () => {
    return new Promise((resolve, reject) => {
        resolve(50)
    })
}

module.exports.getAllTransactionsForWallet =  () => {
    return new Promise((resolve, reject) => {
     resolve([{result:{gasUsed:5}, action: { input: "input", to: "to", from: "from", hash: "hash"}, to: "to", from: "from", hash: "hash" }])
    })
}



