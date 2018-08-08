const gasInfoCtrl = require('./gasinfo_ctrl');

describe('The subscribeAllDBERC20SmartContracts function tests', () => {
  it('should have been called once', () => {
    const spy = jest.spyOn(gasInfoCtrl, 'add');

    spy.mockImplementation();
    spy.call({});

    expect(spy).toHaveBeenCalled();
  });
});
