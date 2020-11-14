import * as StepFunctions from 'aws-sdk/clients/stepfunctions';
import awsTesting from 'aws-testing-library/lib/chai';
import { stopRunningExecutions } from 'aws-testing-library/lib/utils/stepFunctions';
import chai = require('chai');
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StepFunctionArn: stateMachineArn, region } = require(path.join(
  __dirname,
  '..',
  'config.json',
));

chai.use(awsTesting);
const { expect } = chai;

jest.setTimeout(60000);

describe('stepFunctions', () => {
  describe('chai', () => {
    beforeEach(async () => {
      await stopRunningExecutions(region, stateMachineArn);
    });

    afterEach(async () => {
      await stopRunningExecutions(region, stateMachineArn);
    });

    test('should pass through all states on state machine execution', async () => {
      const stepFunctions = new StepFunctions({ region });
      await stepFunctions.startExecution({ stateMachineArn }).promise();
      await expect({ region, stateMachineArn }).to.have.state('State1');
      await expect({ region, stateMachineArn }).to.have.state('State2');
      await expect({ region, stateMachineArn }).to.have.state('State3');
      await expect({ region, stateMachineArn }).to.have.state('State4');
      await expect({ region, stateMachineArn }).to.have.state('State5');
    });
  });
});
