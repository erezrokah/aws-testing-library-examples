import awsTesting from 'aws-testing-library/lib/chai';
import { clearAllItems } from 'aws-testing-library/lib/utils/dynamoDb';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import chai = require('chai');
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DynamoDbTableName: table, region, functions } = require(path.join(
  __dirname,
  '..',
  'config.json',
));
const { create } = functions;

chai.use(awsTesting);
const { expect } = chai;

jest.setTimeout(60000);

describe('dynamoDb', () => {
  describe('chai', () => {
    beforeEach(async () => {
      await clearAllItems(region, table);
    });

    afterEach(async () => {
      await clearAllItems(region, table);
    });

    test('should create db entry on lambda invoke', async () => {
      const body = { text: 'text from test' };
      const result = await invoke(region, create, {
        body: JSON.stringify(body),
      });
      const lambdaItem = JSON.parse(result.body);

      await expect({ region, table, timeout: 0 }).to.have.item(
        { id: lambdaItem.id },
        lambdaItem,
      );
      expect(lambdaItem.text).to.eq(body.text);
    });
  });
});
