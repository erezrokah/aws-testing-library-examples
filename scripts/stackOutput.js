/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs/promises');

const handler = async (data, serverless) => {
  const region = serverless.variables.service.custom.currentRegion;
  const {
    S3BucketName,
    KinesisStreamName,
    DynamoDbTableName,
    ServiceEndpoint,
    StepFunctionArn,
    NotificationsTopicArn,
  } = data;

  const allFunctions = serverless.variables.service.functions;
  const functions = Object.fromEntries(
    Object.entries(allFunctions).map(([key, func]) => [key, func.name]),
  );

  await fs.writeFile(
    path.join(__dirname, '..', 'src', '__tests__', 'config.json'),
    JSON.stringify(
      {
        S3BucketName,
        KinesisStreamName,
        DynamoDbTableName,
        ServiceEndpoint,
        StepFunctionArn,
        NotificationsTopicArn,
        region,
        functions,
      },
      null,
      2,
    ),
  );
};

module.exports = { handler };
