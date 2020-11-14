import { clearAllItems } from 'aws-testing-library/lib/utils/dynamoDb';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DynamoDbTableName: table, region, functions } = require(path.join(
  __dirname,
  '..',
  'config.json',
));
const { create } = functions;

describe('dynamoDb', () => {
  describe('jest', () => {
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

      expect.assertions(2);
      await expect({ region, table, timeout: 0 }).toHaveItem(
        { id: lambdaItem.id },
        lambdaItem,
      );
      expect(lambdaItem.text).toBe(body.text);
    });
  });
});
