const Mongoose = require('../services/dbServices').mongoose;


/* NEW SCHEMA NOT YET IMPLEMENTED
const accountsSchema = Mongoose.Schema({
  pillarId: { type: Number, required: true },
  addresses: [
    {
      protocol: String,
      walletId: String
    }
  ]
});
*/

const accountsSchema = Mongoose.Schema({
  walletID: { type: String, required: true },
  address: { type: String, required: true },
  FCMIID: { type: String, required: true },
});

const Accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = Accounts;
