function listAll() {
  const ethAddressesArray = [
    { address: '0x81b7E08F65Bdf5648606c89998A9CC8164397647'.toUpperCase() },
    { address: '0x4e4eeACA5BE6B0fd8B5c83470AbB4A996B7d289C'.toUpperCase() },
    { address: '0x13C0C69B3C6C2670e08d5B1dABe9BE44BFaD5795'.toUpperCase() },
    { address: '0x31Cce510798Aa8E8dE42EB3339C494FC79E90583'.toUpperCase() },
    { address: '0x1781BD8BB7C48DE5C77650bF0795328ba41DC46e'.toUpperCase() },
    { address: '0x555Ee11FBDDc0E49A9bAB358A8941AD95fFDB48f'.toUpperCase() },
  ];
  return new Promise(((resolve) => {
    resolve(ethAddressesArray);
  }));
}
module.exports.listAll = listAll;

function getFCMIID() {
  const FCMIID = 'FCMIID';
  return new Promise(((resolve) => {
    resolve(FCMIID);
  }));
}
module.exports.getFCMIID = getFCMIID;

function findByAddress() {
  const address = 'address';
  return new Promise(((resolve) => {
    resolve(address);
  }));
}
module.exports.findByAddress = findByAddress;

