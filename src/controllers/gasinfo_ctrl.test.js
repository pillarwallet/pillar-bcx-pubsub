const gasInfoCtrl = require('./gasinfo_ctrl');

describe('The gasinfo_ctrl function tests', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have been called once', () => {
    const spy = jest.spyOn(gasInfoCtrl, 'add');

    spy.mockImplementation();
    spy.call({});

    expect(spy).toHaveBeenCalled();
  });

  it('should have been called once', () => {
    const spy = jest.spyOn(gasInfoCtrl, 'getGasInfo');

    spy.mockImplementation();
    spy.call();

    expect(spy).toHaveBeenCalled();
  });
});