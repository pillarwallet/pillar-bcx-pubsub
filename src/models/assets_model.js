const Mongoose = require('../services/dbServices.js').mongoose;
// NEW DB SCHEMA
const assetsSchema = Mongoose.Schema({
  protocol: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  decimals: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  totalSupply: { type: Number, required: false },
  url: { type: String, required: false },
  category: {type: String, required: false}
});

const Assets = Mongoose.model('Assets', assetsSchema);

module.exports.Assets = Assets;
