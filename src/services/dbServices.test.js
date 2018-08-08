const dbServices = require('./dbServices.js');

describe('Test dbConnect function', () => {
  test('dbConnect should call mongoose.connect once', () => {
    jest.mock('mongoose');
    const spy = jest.spyOn(dbServices, 'dbConnect');
    const arg = { useMongoClient: true };

    spy.mockImplementation();
    spy.call(arg);

    expect(spy).toHaveBeenCalled();
  });
});
