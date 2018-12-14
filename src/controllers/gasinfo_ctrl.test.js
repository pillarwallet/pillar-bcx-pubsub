const gasInfoCtrl = require('./gasinfo_ctrl');

afterAll(() => {
  jest.restoreAllMocks();
});

describe('The subscribeAllDBERC20SmartContracts function tests', () => {
  it('should have been called once', () => {
    const spy = jest.spyOn(gasInfoCtrl, 'add');

    spy.mockImplementation();
    spy.call({});

    expect(spy).toHaveBeenCalled();
  });
});
