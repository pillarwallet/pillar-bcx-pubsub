const Mongoose = require('../services/dbServices').mongoose;

const offersSchema = Mongoose.Schema({
    id: String,
    name: String,
    publicKey: String,
});

const Offers = Mongoose.model('GasInfo', offersSchema);

module.exports.Offers = Offers;
