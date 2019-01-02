

afterAll(() => {
  jest.restoreAllMocks();
});

describe('The add function tests', () => {
  it('should have been resolved the promise', done => {
    jest.mock('../models/gasinfo_model.js');
    
    const gasInfoCtrl = require('./gasinfo_ctrl');
    return gasInfoCtrl.add('record')
      .then(() => {
        done();
      });
  });
});
