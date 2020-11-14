import awsTesting from 'aws-testing-library/lib/chai';
import chai = require('chai');
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ServiceEndpoint } = require(path.join(__dirname, '..', 'config.json'));

const url = `${ServiceEndpoint}/api/public`;

jest.setTimeout(60000);

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
