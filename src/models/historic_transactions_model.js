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

// NEW DB SCHEMA
const transactionsSchema = Mongoose.Schema({
  action: {
    from: { type: String, required: false, default: null },
    gas: { type: String, required: false, default: null },
    init: { type: String, required: false, default: null },
    value: { type: String, required: false, default: null },
    input: { type: String, required: false, default: null },
    to: { type: String, required: false, default: null },
  },
  blockHash: { type: String, required: true, default: null },
  blockNumber: { type: Number, required: true, default: null },
  result: {
    address: { type: String, required: false, default: null },
    code: { type: String, required: false, default: null },
    gasUsed: { type: String, required: false, default: null },
  },
  transactionHash: { type: String, required: false, default: null },
  transactionPosition: { type: Number, required: false, default: null },
  type: { type: String, required: true, default: null },
});

const HistoricTransactions = Mongoose.model(
  'HistoricTransactions',
  transactionsSchema,
);

module.exports.HistoricTransactions = HistoricTransactions;
