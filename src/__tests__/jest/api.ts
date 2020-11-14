import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ServiceEndpoint } = require(path.join(__dirname, '..', 'config.json'));

const url = `${ServiceEndpoint}/api/public`;

describe('api', () => {
  describe('jest', () => {
    test('should return valid api response', async () => {
      expect.assertions(1);
      await expect({
        method: 'POST',
        url,
      }).toReturnResponse({
        data: {
          message: 'Hi ⊂◉‿◉つ from API',
        },
        statusCode: 200,
      });
    });
  });
});
