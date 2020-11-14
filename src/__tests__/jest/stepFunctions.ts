import * as StepFunctions from 'aws-sdk/clients/stepfunctions';
import { stopRunningExecutions } from 'aws-testing-library/lib/utils/stepFunctions';
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StepFunctionArn: stateMachineArn, region } = require(path.join(
  __dirname,
  '..',
  'config.json',
));

describe('stepFunctions', () => {
  describe('jest', () => {
    beforeEach(async () => {
      await stopRunningExecutions(region, stateMachineArn);
    });

    afterEach(async () => {
      await stopRunningExecutions(region, stateMachineArn);
    });

    test('should pass through all states on state machine execution', async () => {
      const stepFunctions = new StepFunctions({ region });
      await stepFunctions.startExecution({ stateMachineArn }).promise();
      await expect({ region, stateMachineArn }).toHaveState('State1');
      await expect({ region, stateMachineArn }).toHaveState('State2');
      await expect({ region, stateMachineArn }).toHaveState('State3');
      await expect({ region, stateMachineArn }).toHaveState('State4');
      await expect({ region, stateMachineArn }).toHaveState('State5');
    });
  });
});
