const Mongoose = require('../services/dbServices.js').mongoose;

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  pillarId: { type: String, required: true },
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

/* OLD DB SCHEMA
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
*/

// The following lime needs to be commented for dbServices.test.js tests to pass (issue with Jest)
transactionsSchema.index({ to: 1, from: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
