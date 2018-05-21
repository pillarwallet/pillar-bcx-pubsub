const Mongoose = require('../services/dbServices.js').mongoose;

const accountsSchema = Mongoose.Schema({
  pillarId: { type: Number, required: true },
  addresses: {
    ethereum : { type: String, required: true },
    bitcoin : { type: String, required: true },
    litecoin : { type: String, required: true }
  }
});

const accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = accounts;
