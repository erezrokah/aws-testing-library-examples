const path = require('path');
const fs = require('fs-extra');

const handler = async (data, serverless, _) => {
  const region = serverless.variables.service.custom.currentRegion;
  const stage = serverless.variables.service.custom.currentStage;
  const { S3BucketName, KinesisStreamName, DynamoDbTableName } = data;

  const allFunctions = serverless.variables.service.functions;
  const functions = {};
  Object.keys(allFunctions).forEach(f => {
    functions[f] = allFunctions[f].name;
  });

  await fs.writeJSON(
    path.join(__dirname, '..', 'src', '__tests__', 'config.json'),
    {
      S3BucketName,
      KinesisStreamName,
      DynamoDbTableName,
      region,
      functions,
    },
    { spaces: 2 },
  );
};

module.exports = { handler };
