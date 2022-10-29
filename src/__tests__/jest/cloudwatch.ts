import { invoke } from 'aws-testing-library/lib/utils/lambda';
import path = require('path');
import { v1 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { region, functions } = require(path.join(
  __dirname,
  '..',
  'config.json',
));
const { log } = functions;

describe('dynamoDb', () => {
  describe('jest', () => {
    test('should write log message lambda invoke', async () => {
      const body = { message: 'message from test ' + uuid() };
      await invoke(region, log, {
        body: JSON.stringify(body),
      });

      expect.assertions(1);
      await expect({ region, function: log, timeout: 30 * 1000 }).toHaveLog(
        `"${body.message}"`,
      );
    });
  });
});
