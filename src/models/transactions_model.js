/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const Mongoose = require('../services/dbServices.js').mongoose;

const transactionsSchema = Mongoose.Schema({
  pillarId: { type: String, required: false, default: null },
  protocol: { type: String, required: true, default: null },
  fromAddress: { type: String, required: false, default: null },
  toAddress: { type: String, required: false, default: null },
  txHash: { type: String, required: true, default: null },
  txHashReplaced: { type: String, required: false, default: null },
  asset: { type: String, required: false, default: null },
  contractAddress: { type: String, required: false, default: null },
  timestamp: { type: Number, required: false, default: null },
  blockNumber: { type: Number, required: false, default: null },
  nonce: { type: Number, required: false, default: null },
  value: { type: Number, required: false, default: null },
  status: { type: String, required: false, default: null },
  gasPrice: { type: Number, required: false, default: null },
  gasUsed: { type: Number, required: false, default: null },
  tranType: { type: String, required: false, default: null },
  tokenId: { type: Number, required: false, default: null },
});

const Transactions = Mongoose.model('Transactions', transactionsSchema);

module.exports.Transactions = Transactions;
