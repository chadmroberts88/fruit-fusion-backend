const handler = require('./handler');

test('Should return 200.', async () => {

  // need some mock event
  const sampleEvent = {
    pathParameters: {
      id: "1"
    }
  };

  const response = await handler.getUser(sampleEvent);

  expect(response.statusCode).toEqual(200);
});