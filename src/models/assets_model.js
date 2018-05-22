const Mongoose = require('../services/dbServices.js').mongoose;
/* NEW SCHEMA NOT YET IMPLEMENTED
const assetsSchema = Mongoose.Schema({
  protocol: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  decimals: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  totalSupply: { type: Number, required: true },
  url: { type: String, required: true }
});
*/

const assetsSchema = Mongoose.Schema({
  address: { type: String, required: true },
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  decimals: { type: Number, required: true },
});

const assets = Mongoose.model('Assets', assetsSchema);

module.exports.Assets = assets;
