const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  protocol: { type: String, required: true },
  txHash: { type: String, required: true },
  contractAddress: { type: String, required: false },
  timestamp: { type: Number, required: false },
  blockNumber: { type: Number, required: false },
  status: { type: String, required: false },
  gasPrice: { type: Number, required: false },
  gasUsed: { type: Number, required: false },
  trans: [{
    fromAddress: { type: String, required: false },
    toAddress: { type: String, required: false },
    value: { type: Number, required: false },
    asset: { type: String, required: false },
  },]
});

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
