var ethService = require("./ethService")
const logger = require('../utils/logger');

/**
 * Subscribe to geth WS event corresponding to new pending transactions.
 */




async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAndRetry(web3Func, param){
    let block = null;
    let count = 0;
    while ((block = await ethService.web3.eth[web3Func](param)) == null && count < 20) {
        count++;
        await sleep(4000);
    }
    if (block) {
        return block
    } else {
        throw new Error(`${web3Func} returned null for ${param}. count${count} . `)
    }
}

module.exports.getAndRetry = getAndRetry
