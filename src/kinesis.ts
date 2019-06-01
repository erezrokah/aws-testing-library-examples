import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as Kinesis from 'aws-sdk/clients/kinesis';
import { v1 as uuid } from 'uuid';

const StreamName = process.env.STREAM || '';

interface IRecord {
  message: string;
}

export const queue: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback?: Callback,
) => {
  const parsed = JSON.parse(event.body || '');
  const item = parsed.record as IRecord;
  const record = { message: item.message, id: uuid() };
  const params = {
    Data: JSON.stringify({
      record,
      timestamp: new Date().toISOString(),
    }),
    PartitionKey: record.id,
    StreamName,
  };
  const kinesis = new Kinesis();
  return await kinesis.putRecord(params).promise();
};
