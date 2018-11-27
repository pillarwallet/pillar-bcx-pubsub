const Mongoose = require('../services/dbServices').mongoose;


// NEW DB SCHEMA
const gasInfoSchema = Mongoose.Schema({
    protocol: String,
    gasLimit: Number,
    gasUsed: Number,
    avgGasPrice: Number,
    transactionCount: Number,
    blockNumber: Number
});

const GasInfo = Mongoose.model('GasInfo', gasInfoSchema);

module.exports.GasInfo = GasInfo;
