import { APIGatewayEvent, Handler } from 'aws-lambda';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { v1 as uuid } from 'uuid';

const TableName = process.env.DYNAMODB_TABLE || '';

export const create: Handler = async (event: APIGatewayEvent) => {
  const parsed = JSON.parse(event.body || '');
  const text = parsed.text;

  const createdAt = Date.now();
  const params = {
    Item: {
      createdAt,
      id: uuid(),
      text,
      updatedAt: createdAt,
    },
    TableName,
  };

  const dynamoDb = new DynamoDB.DocumentClient();
  await dynamoDb.put(params).promise();
  const response = {
    body: JSON.stringify(params.Item),
    statusCode: 200,
  };
  return response;
};
