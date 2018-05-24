function listAll() {
  const addressesArray = [
    {
      address: '0xd55ebfba026cf4c321d939dcd488394bb358ebf8'.toUpperCase(), name: 'Pillar', ticker: 'PLR', decimals: 18,
    },
    {
      address: '0x583cbBb8a8443B38aBcC0c956beCe47340ea1367'.toUpperCase(), name: 'BokkyPooBah Test Token', ticker: 'BOKKY', decimals: 18,
    },
  ];
  return new Promise(((resolve) => {
    resolve(addressesArray);
  }));
}
module.exports.listAll = listAll;

function findByTicker() {
  return new Promise(((resolve) => {
    resolve({ address: '0xSmartContractAddress' });
  }));
}
module.exports.findByTicker = findByTicker;

function findByAddress() {
  const ticker = 'PLR';
  return new Promise(((resolve) => {
    resolve({ ticker });
  }));
}
module.exports.findByAddress = findByAddress;

function findERC20SmartContractsHistoryHeight() {
  return new Promise(((resolve) => {
    resolve(2461146);
  }));
}
module.exports.findERC20SmartContractsHistoryHeight = findERC20SmartContractsHistoryHeight;

function updateERC20SmartContractsHistoryHeight() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.updateERC20SmartContractsHistoryHeight = updateERC20SmartContractsHistoryHeight;

function addZeroSmartContractsCreationHistoryHeight() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.addZeroSmartContractsCreationHistoryHeight
  = addZeroSmartContractsCreationHistoryHeight;

function emptyCollection() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.emptyCollection = emptyCollection;

function addContract() {
  return new Promise(((resolve) => {
    resolve();
  }));
}
module.exports.addContract = addContract;

