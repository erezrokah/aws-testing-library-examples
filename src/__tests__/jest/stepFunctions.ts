import * as StepFunctions from 'aws-sdk/clients/stepfunctions';
import 'aws-testing-library/lib/jest';
import { stopRunningExecutions } from 'aws-testing-library/lib/utils/stepFunctions';
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { StepFunctionArn: stateMachineArn, region } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);

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
