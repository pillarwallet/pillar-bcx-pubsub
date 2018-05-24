const Mongoose = require('../services/dbServices.js').mongoose;


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

const accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = accounts;
