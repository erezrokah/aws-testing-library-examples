import { invoke } from 'aws-testing-library/lib/utils/lambda';
import { clearAllObjects } from 'aws-testing-library/lib/utils/s3';
import fetch from 'node-fetch';
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { S3BucketName: bucket, region, functions } = require(path.join(
  __dirname,
  '..',
  'config.json',
));
const { save } = functions;

describe('s3', () => {
  describe('jest', () => {
    beforeEach(async () => {
      await clearAllObjects(region, bucket);
    });

    afterEach(async () => {
      await clearAllObjects(region, bucket);
    });

    test('should create object in s3 on lambda invoke', async () => {
      const body = {
        file_url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/240px-Google_2015_logo.svg.png',
        key: '240px-Google_2015_logo.svg.png',
      };

      const result = await invoke(region, save, {
        body: JSON.stringify(body),
      });

      expect.assertions(2);

      const parsedResult = JSON.parse(result.body);
      expect(parsedResult.message).toEqual('File saved');
      const expectedBuffer = await (await fetch(body.file_url)).arrayBuffer();

      await expect({ region, bucket, timeout: 0 }).toHaveObject(
        body.key,
        Buffer.from(expectedBuffer),
      );
    });
  });
});
