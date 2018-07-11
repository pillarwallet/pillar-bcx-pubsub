require('dotenv').config()
const EC = require('elliptic').ec;
const secp256k1 = new EC('secp256k1');
const Tx = require('ethereumjs-tx');
const Web3 = require('Web3');
const util = require('ethereumjs-util');
const expect = require('expect');
var MongoClient = require('mongodb').MongoClient;
const {defineSupportCode, setDefaultTimeout} = require('cucumber');
setDefaultTimeout(100 * 1000);

let Accounts = require('./../glue/accounts_model.js');

const senderAddress = process.env.SENDER_ADDRESS;

const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;

let web3;
let receiver;
let hash;
var account;

defineSupportCode(function({ Given, Then, When, setDefaultTimeout }) {
  
  Given('An ethereum address', () =>{
    receiver = secp256k1.genKeyPair();
    receiver.address = '0x' + util.privateToAddress(receiver.priv).toString('hex');
  });
  
  When('I register a new wallet', async () => {
    var db = await MongoClient.connect(mongoUrl)
    var dbo =  await db.db(dbName);
    account = new Accounts.Accounts({pillarId: "QAWallet", addresses : [{protocol: 'Ethereum', address: receiver.address}]});
    await dbo.collection("accounts").insertOne(account);
    await db.close();
    });

  When('I connect to a node', () =>{
    const gethURL = process.env.GETH_RPC_URL + ':' + process.env.GETH_RPC_PORT;
    web3 = new Web3(new Web3.providers.HttpProvider(gethURL));
  });

  When('I send a transaction', async () => {
    var nonce = await web3.eth.getTransactionCount(process.env.SENDER_ADDRESS)
    tx = new Tx({
      nonce: nonce,
      from: process.env.SENDER_ADDRESS, 
      to: receiver.address, 
      value: 0,
      gasPrice: '0x12A05F2000',
      gasLimit: '0x55f0',
      chainId: 3
    });
    tx.sign(new Buffer(process.env.SENDER_PRIV, 'hex'));
    hash = "0x" + tx.hash().toString('hex');
    await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
  });

  Then('Expect to find the transaction in the database', async () => {
    setTimeout(() => {}, 5000);
    var db = await MongoClient.connect(mongoUrl)
    var dbo =  await db.db(dbName);
    var count = await dbo.collection("transactions").find({txHash: hash}).count();
    await db.close();
    expect(count).toBe(1);
  });
});