const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
    action: {
        from: { type: String, required: true },
        gas: { type: String, required: true },
        init: { type: String, required: true },
        value: { type: String, required: true },
    },
    blockHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    result: {
        address: { type: String, required: true },
        code: { type: String, required: true },
        gasUsed: { type: String, required: true },
    },
    transactionHash: { type: String, required: true },
    transactionPosition: { type: Number, required: true },
    type: { type: String, required: true }
})

const HistoricTransactions = Mongoose.model('HistoricTransactions', transactionsSchema);

module.exports.HistoricTransactions = HistoricTransactions;
