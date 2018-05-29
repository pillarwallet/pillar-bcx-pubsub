const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  pillarId: String,
  protocol: String,
  fromAddress: String,
  toAddress: String,
  txHash: String,
  asset: String,
  contractAddress: String,
  timestamp: Number,
  blockNumber: Number,
  value: Number,
  status: String,
  gasUsed: Number,
});

/* OLD DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  to: String,
  from: String,
  asset: String,
  contractAddress: String,
  timestamp: Number,
  value: Number,
  status: String,
  gasUsed: String
});
*/
transactionsSchema.index({ to: 1, from: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
