import 'aws-testing-library/lib/jest';
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { ServiceEndpoint } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);

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
