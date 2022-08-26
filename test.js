const handler = require('./handler');

describe('GetUser', () => {
  test('Should return 200.', async () => {
    const sampleEvent = {
      pathParameters: {
        id: "1"
      }
    };
    const response = await handler.getUser(sampleEvent);
    expect(response.statusCode).toEqual(200);
  });
});