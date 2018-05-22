const Mongoose = require('../subServices/dbServices.js').mongoose;

const assetsSchema = Mongoose.Schema({
  protocol: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  decimals: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  totalSupply: { type: Number, required: true },
  url: { type: String, required: true }
});

const assets = Mongoose.model('Assets', assetsSchema);

module.exports.Assets = assets;
