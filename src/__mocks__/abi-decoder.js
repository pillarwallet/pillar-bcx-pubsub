function addABI() {

}
module.exports.addABI = addABI;

function decodeMethod() {
  return {name:"transfer", params: [{value:"0xAddress"}, {value:"1"}]};
}
module.exports.decodeMethod = decodeMethod;