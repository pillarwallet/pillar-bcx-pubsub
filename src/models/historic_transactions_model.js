const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
    action: {
        from: { type: String, required: false },
        gas: { type: String, required: false },
        init: { type: String, required: false },
        value: { type: String, required: false },
        input: { type: String, required: false },
        to: { type: String, required: false }
    },
    blockHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    result: {
        address: { type: String, required: false },
        code: { type: String, required: false },
        gasUsed: { type: String, required: false },
    },
    transactionHash: { type: String, required: false },
    transactionPosition: { type: Number, required: false },
    type: { type: String, required: true }
})

const HistoricTransactions = Mongoose.model('HistoricTransactions', transactionsSchema);

module.exports.HistoricTransactions = HistoricTransactions;


