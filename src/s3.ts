import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as S3 from 'aws-sdk/clients/s3';
import fetch from 'node-fetch';

const Bucket = process.env.BUCKET || '';

export const save: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback?: Callback,
) => {
  const parsed = JSON.parse(event.body || '');
  const fileUrl = parsed.file_url || '';
  const key = parsed.key || '';

  const s3 = new S3();

  const fetchResponse = await fetch(fileUrl);
  if (fetchResponse.ok) {
    const buffer = await fetchResponse.buffer();
    return await s3
      .putObject({
        Body: buffer,
        Bucket,
        Key: key,
      })
      .promise();
  } else {
    throw new Error('Fetch failed. Url: ' + fileUrl);
  }
};
