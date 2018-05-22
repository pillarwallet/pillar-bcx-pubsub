const Mongoose = require('../subServices/dbServices.js').mongoose;

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

const transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = transactions;
