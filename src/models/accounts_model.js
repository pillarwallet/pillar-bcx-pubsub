const Mongoose = require('../services/dbServices.js').mongoose;

const accountsSchema = Mongoose.Schema({
  pillarId: { type: Number, required: true },
  addresses: [
    {
      protocol: String,
      walletId: String 
    }
  ]
});

const accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = accounts;
