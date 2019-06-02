import 'aws-testing-library/lib/jest';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import { readJsonSync } from 'fs-extra';
import path = require('path');
import { v1 as uuid } from 'uuid';

const { region, functions } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);
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
        body.message,
      );
    });
  });
});
