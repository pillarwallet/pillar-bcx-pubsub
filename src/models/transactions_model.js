const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  pillarId: { type: String, required: false },
  protocol: { type: String, required: true },
  fromAddress: { type: String, required: false },
  toAddress: { type: String, required: false },
  txHash: { type: String, required: true },
  asset: { type: String, required: false },
  contractAddress: { type: String, required: false },
  timestamp: { type: Number, required: false },
  blockNumber: { type: Number, required: false },
  value: { type: Number, required: false },
  status: { type: String, required: false },
  gasPrice: { type: Number, required: false },
  gasUsed: { type: Number, required: false },
});

// transactionsSchema.index({ txHash: 1, type: 1});
// transactionsSchema.index({ toAddress: 1, type: 1});
// transactionsSchema.index({ fromAddress: 1, type: 1});
// transactionsSchema.index({ contractAddress: 1, type: 1});
// transactionsSchema.index({ blockNumber: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
