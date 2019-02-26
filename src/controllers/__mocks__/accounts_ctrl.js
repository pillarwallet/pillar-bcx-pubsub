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
  const ethAddressesArray = [
    { address: '0x81b7E08F65Bdf5648606c89998A9CC8164397647'.toUpperCase() },
    { address: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C'.toUpperCase() },
    { address: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795'.toUpperCase() },
    { address: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583'.toUpperCase() },
    { address: '0x1781BD8BB7C48DE5C77650bF0795328ba41DC46e'.toUpperCase() },
    { address: '0x555Ee11FBDDc0E49A9bAB358A8941AD95fFDB48f'.toUpperCase() },
  ];
  return new Promise(resolve => {
    resolve(ethAddressesArray);
  });
}
module.exports.listAll = listAll;

function findByAddress(address) {
  return new Promise(resolve => {
    if (
      address === '0x81b7E08F65Bdf5648606c89998A9CC8164397647'.toLowerCase()
    ) {
      resolve({ address, pillarId: 'pillarId' });
    } else resolve();
  });
}
module.exports.findByAddress = findByAddress;

function findByWalletId() {
  return new Promise(resolve => {
    resolve({
      save: closure => {
        closure(false);
      },
      addresses: [
        { address: 'address1', status: 'deferrred' },
        {
          save: closure => {
            closure(false);
          },
          address: 'address2',
          status: null,
        },
      ],
      pillarId: 'pillarId',
    });
  });
}

module.exports.findByWalletId = findByWalletId;

function findByStatus(status) {
  return new Promise(resolve => {
    resolve({
      save: closure => {
        closure(false);
      },
      addresses: [
        { address: 'address1', status },
        {
          save: closure => {
            closure(false);
          },
          address: 'address2',
          status: null,
        },
      ],
      pillarId: 'pillarId',
    });
  });
}

module.exports.findByStatus = findByStatus;
