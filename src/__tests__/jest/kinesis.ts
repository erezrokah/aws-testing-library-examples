import 'aws-testing-library/lib/jest';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { KinesisStreamName: stream, region, functions } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);
const { queue } = functions;

describe('kinesis', () => {
  describe('jest', () => {
    test('should put record in stream on lambda invoke', async () => {
      const body = {
        record: { message: 'message from test' },
      };

      const result = await invoke(region, queue, {
        body: JSON.stringify(body),
      });

      const { data } = JSON.parse(result.body);

      expect.assertions(2);
      expect(data.message).toEqual('Record saved');
      await expect({ region, stream }).toHaveRecord(({ record }) => {
        return record.id === data.id && record.message === body.record.message;
      });
    });
  });
});
