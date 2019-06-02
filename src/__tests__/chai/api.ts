import awsTesting from 'aws-testing-library/lib/chai';
import chai = require('chai');
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { ServiceEndpoint } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);

const url = `${ServiceEndpoint}/api/public`;

describe('api', () => {
  describe('chai', () => {
    chai.use(awsTesting);
    const { expect } = chai;

    test('should return valid api response', async () => {
      await expect({
        method: 'POST',
        url,
      }).to.have.response({
        data: {
          message: 'Hi ⊂◉‿◉つ from API',
        },
        statusCode: 200,
      });
    });
  });
});
