const gethConnect = require('./gethConnect.js');// .gethConnect();

describe('Test setWeb3WebsocketConnection', () => {
  test('setWeb3WebsocketConnection function should be defined', (done) => {
    expect(gethConnect.setWeb3WebsocketConnection).toBeDefined();
    done();
  });
});
