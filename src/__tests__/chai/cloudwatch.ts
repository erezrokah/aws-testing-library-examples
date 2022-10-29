import awsTesting from 'aws-testing-library/lib/chai';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import chai = require('chai');
import path = require('path');
import { v1 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { region, functions } = require(path.join(
  __dirname,
  '..',
  'config.json',
));
const { log } = functions;

chai.use(awsTesting);
const { expect } = chai;

jest.setTimeout(60000);

describe('dynamoDb', () => {
  describe('chai', () => {
    test('should write log message lambda invoke', async () => {
      const body = { message: 'message from test ' + uuid() };
      await invoke(region, log, {
        body: JSON.stringify(body),
      });

      await expect({ region, function: log, timeout: 30 * 1000 }).to.have.log(
        `"${body.message}"`,
      );
    });
  });
});
