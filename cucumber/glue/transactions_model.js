const Mongoose = require('mongoose');

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

transactionsSchema.index({ to: 1, from: 1 });

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;