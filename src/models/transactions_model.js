const Mongoose = require('../services/dbServices.js').mongoose;

const transactionsSchema = Mongoose.Schema({
  pillarId: String,
  protocol: String,
  fromAddress: String,
  toAddress: String,
  txHash: String,
  asset: String,
  contractAddress: String,
  timestamp: String,
  blockNumber: String,
  value: String,
  status: String,
  gasUsed: String
});

transactionsSchema.index({ to: 1, from: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
