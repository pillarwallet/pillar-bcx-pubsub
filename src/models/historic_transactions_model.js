const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
    action: {
        from: { type: String, required: true },
        gas: { type: String, required: true },
        init: { type: String, required: false },
        value: { type: String, required: true },
        input: { type: String, required: false },
        to: { type: String, required: false }
    },
    blockHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    result: {
        address: { type: String, required: false },
        code: { type: String, required: false },
        gasUsed: { type: String, required: true },
    },
    transactionHash: { type: String, required: true },
    transactionPosition: { type: Number, required: true },
    type: { type: String, required: true }
})

const HistoricTransactions = Mongoose.model('HistoricTransactions', transactionsSchema);

module.exports.HistoricTransactions = HistoricTransactions;
