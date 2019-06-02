import awsTesting from 'aws-testing-library/lib/chai';
import { invoke } from 'aws-testing-library/lib/utils/lambda';
import chai = require('chai');
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { KinesisStreamName: stream, region, functions } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);
const { queue } = functions;

chai.use(awsTesting);
const { expect } = chai;

jest.setTimeout(60000);

describe('kinesis', () => {
  describe('chai', () => {
    test('should put record in stream on lambda invoke', async () => {
      const body = {
        record: { message: 'message from test' },
      };

      const result = await invoke(region, queue, {
        body: JSON.stringify(body),
      });

      const { data } = JSON.parse(result.body);

      expect(data.message).to.eq('Record saved');
      await expect({ region, stream }).to.have.record(({ record }) => {
        return record.id === data.id && record.message === body.record.message;
      });
    });
  });
});
