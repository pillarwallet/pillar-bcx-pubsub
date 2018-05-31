const logger = require('../utils/logger.js');

var colors = require('colors');
let accountsArray = [
    {'walletID' : '00000000001','publicAddress' : '0xabA31e585c4a221d9e196EA46c98793e0A0490bD', 'FCMIID' : 'fNUMAw_LLT8:APA91bFT8wlE3IG0BSvEeoJ2LPZVPrmiX9lOLKMbP3zWOCI_FC_6-foSQIoOU5p9DN_9O0lFpHxSkmQwh5gzs8Ff7E8IReo_IpFkHi5DWfhNvd1KLIcXzGSS3olR_kVv2tXCgM4xFZc2'},
    {'walletID' : '00000000002','publicAddress' : '0x486592D425272B856fd15eD7bFb2E6ac5CfC187E', 'FCMIID' : 'ex-CrIVlQY0:APA91bE53-oua_1iee8s6wqaWG2TKXK81H4xF491ruatbSuKbg5OK02J5kpxJzlLmOdXDMqXYk-lj15vbz1eFeNa_GhI5K28ISzJFPQsRP2hrStAcgp_WtJKXa9wGnVuE_krmBD7oqrT'},
/*
    {'walletID' : '00000000003','publicAddress' : '0xa2a8c318ce7cF2992003dEae9384A1AB90b04F77','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000004','publicAddress' : '0x2a0561d91905abE638e5C57FB1889cE99af64E27','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000005','publicAddress' : '0x59b2802623d2773EFd2EF1B804cf39b34Df7671f','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000006','publicAddress' : '0x8210357f377e901f18e45294e86a2a32215cc3c9','FCMIID' : 'FCMIID'},//FROM THIS LINE AND BELOW: active accounts fount on etherscan
    {'walletID' : '00000000007','publicAddress' : '0xc91eb53b03024676797aebc0390b6a485e4774fe','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000008','publicAddress' : '0x4d6bb4ed029b33cf25d0810b029bd8b1a6bcab7b','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000009','publicAddress' : '0x81b7e08f65bdf5648606c89998a9cc8164397647','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000010','publicAddress' : '0xd490af05bf82ef6c6ba034b22d18c39b5d52cc54','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000011','publicAddress' : '0x555ee11fbddc0e49a9bab358a8941ad95ffdb48f','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000012','publicAddress' : '0x66b2f0fe4c931e2fbdcebd314746fa53f510c617','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000013','publicAddress' : '0x687422eea2cb73b5d3e242ba5456b782919afc85','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000014','publicAddress' : '0xbbf5029fd710d227630c8b7d338051b8e76d50b3','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000015','publicAddress' : '0xb436ba50d378d4bbc8660d312a13df6af6e89dfb','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000016','publicAddress' : '0x2351f637462cb01d509f657f5d77e77070edb2ed','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000017','publicAddress' : '0x7237f567ce82e50e3a9efa04b1fd16d4ff6cf0b8','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000018','publicAddress' : '0x6d87462cb31c1217cf1ed61b4fcc37f823c61624','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000019','publicAddress' : '0xa24d28d30ee9711149241510ce66e8791a8043fa','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000020','publicAddress' : '0x12183126314d15ffe8601cbfef4d8ca882e23441','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000021','publicAddress' : '0x201354729f8d0f8b64e9a0c353c672c6a66b3857','FCMIID' : 'FCMIID'},
    {'walletID' : '00000000022','publicAddress' : '0x787f88347aa3eefcc16e9e71c672138181bce266','FCMIID' : 'FCMIID'}
   */
];
module.exports.accountsArray = accountsArray;

const contractsArray = [
  {
    address: '0x9471ea41772925e3ff477772681740c9f520d3af'.toUpperCase(), name: 'Pillar', ticker: 'PLR', decimals: 18,
  },
  {
    address: '0x583cbBb8a8443B38aBcC0c956beCe47340ea1367'.toUpperCase(), name: 'BokkyPooBah Test Token', ticker: 'BOKKY', decimals: 18,
  },
];
module.exports.contractsArray = contractsArray;
