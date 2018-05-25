const Mongoose = require('../services/dbServices.js').mongoose;

/* NEW SCHEMA NOT YET IMPLEMENTED
const transactionsSchema = Mongoose.Schema({
  pillarId: Number,
  protocol: String,
  fromAddress: String,
  toAddress: String,
  txHash: String,
  asset: String,
  contractAddress: String,
  timestamp: Number,
  blockNumber: Number,
  value: Number,
  status: Number,
  gasUsed: Number
});
*/

const transactionsSchema = Mongoose.Schema({
  to: String,
  from: String,
  asset: String,
  contractAddress: String,
  timestamp: Number,
  value: Number,
  status: String,
  hash: String,
  gasUsed: Number,
  nbConfirmations: Number,
});

transactionsSchema.index({ to: 1, from: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
