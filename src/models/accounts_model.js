const Mongoose = require('../services/dbServices').mongoose;


// NEW DB SCHEMA
const accountsSchema = Mongoose.Schema({
  pillarId: { type: String, required: true },
  addresses: [
    {
      protocol: String,
      address: String,
    },
  ],
});

const Accounts = Mongoose.model('Accounts', accountsSchema);

module.exports.Accounts = Accounts;
