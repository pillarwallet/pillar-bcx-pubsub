const notif = require('./notifications.js');
const sinon = require('sinon');

describe('Test notifications', () => {
  test('sendNotification should be defined', () => {
    expect(notif.sendNotification).toBeDefined();
  });

  test('sendNotification should call generateJSON once, generatePOSTHeaders once, generatePOSTOptions once and requestSendNotification once', (done) => {
    const spy1 = sinon.spy(notif, 'generateJSON');
    const spy2 = sinon.spy(notif, 'generatePOSTHeaders');
    const spy3 = sinon.spy(notif, 'generatePOSTOptions');
    const spy4 = sinon.spy(notif, 'requestSendNotification');
    return notif.sendNotification('hash', 'from', 'to', 'value', 'asset', 'contractAddress', 'status', 'nbConfirmations', 'to_FCM_IID')
      .then(() => {
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);
        sinon.assert.calledOnce(spy3);
        sinon.assert.calledOnce(spy4);
        spy1.restore();
        spy2.restore();
        spy3.restore();
        spy4.restore();
        done();
      });
  });


  test('requestSendNotification should be defined', () => {
    expect(notif.requestSendNotification).toBeDefined();
  });
  test('generatePOSTHeaders should be defined', () => {
    expect(notif.generatePOSTHeaders).toBeDefined();
  });

  test('generatePOSTHeaders should return proper headers object', (done) => {
    const headers = notif.generatePOSTHeaders('serverKey');

    // expect(headers.Authorization).toEqual("key = serverKey");
    expect(headers['Content-Type']).toEqual('application/json');

    done();
  });


  test('generatePOSTOptions should be defined', () => {
    expect(notif.generatePOSTOptions).toBeDefined();
  });

  test('generatePOSTOptions should return proper options object', (done) => {
    const options = notif.generatePOSTOptions('headers', 'json');

    expect(options.uri).toEqual('https://fcm.googleapis.com/fcm/send');
    expect(options.method).toEqual('POST');

    expect(options.headers).toBeDefined();
    expect(options.json).toBeDefined();

    done();
  });

  test('generateJSON should be defined', () => {
    expect(notif.generateJSON).toBeDefined();
  });
  test('generateJSON should return proper json object', (done) => {
    const json = notif.generateJSON('hash', 'from', 'to', 'value', 'asset', 'contractAddress', 'status', 'nbConfirmations', 'to_FCM_IID');

    expect(json.notification).toBeDefined();
    expect(json.notification.title).toBeDefined();
    expect(json.notification.data).toBeDefined();

    expect(json.notification.data.type).toBeDefined();
    expect(json.notification.data.msg).toBeDefined();

    expect(json.notification.data.msg.hash).toEqual('hash');
    expect(json.notification.data.msg.to).toEqual('to');
    expect(json.notification.data.msg.from).toEqual('from');
    expect(json.notification.data.msg.value).toEqual('value');
    expect(json.notification.data.msg.asset).toEqual('asset');
    expect(json.notification.data.msg.contractAddress).toEqual('contractAddress');
    expect(json.notification.data.msg.status).toEqual('status');
    expect(json.notification.data.msg.nbConfirmations).toEqual('nbConfirmations');
    expect(json.to).toEqual('to_FCM_IID');

    done();
  });
});
