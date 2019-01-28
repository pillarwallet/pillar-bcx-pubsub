/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function listAll() {
  const addressesArray = [
    {
      address: '0xd55ebfba026cf4c321d939dcd488394bb358ebf8'.toUpperCase(), name: 'Pillar', symbol: 'PLR', decimals: 18,
    },
    {
      address: '0x583cbBb8a8443B38aBcC0c956beCe47340ea1367'.toUpperCase(), name: 'BokkyPooBah Test Token', symbol: 'BOKKY', decimals: 18,
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

function findByAddress(address) {
  const ticker = 'PLR';
  return new Promise(((resolve) => {
	  if (address === '0xd55ebfba026cf4c321d939dcd488394bb358ebf8'.toLowerCase()) {
		  resolve({ symbol: ticker });
    }
	  else resolve();
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

