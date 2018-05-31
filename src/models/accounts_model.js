const Mongoose = require('../services/dbServices').mongoose;


// NEW DB SCHEMA
const accountsSchema = Mongoose.Schema({
  pillarId: { type: Number, required: true },
  addresses: [
    {
      protocol: String,
      address: String,
    },
  ],
});

/*
const accountsSchema = Mongoose.Schema({
  walletID: { type: String, required: true },
  address: { type: String, required: true },
  FCMIID: { type: String, required: true },
});
*/
const Accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = Accounts;
