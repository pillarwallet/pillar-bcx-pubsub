var runId = process.argv[2];

describe('Test function calls', () => {

  beforeAll(() =>{
		process.argv[2] = 0;
	});

	afterAll(() =>{
		process.argv[2] = runId;
	});

  test('Expect initServices() to be called', () => {
    const subscriber = require('./subscriber.js');
    const spy = jest.spyOn(subscriber, 'initServices');
    spy.mockImplementation();
    spy.call();
    expect(spy).toHaveBeenCalled();
  });
});
