import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export const log: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback?: Callback,
) => {
  const parsed = JSON.parse(event.body || '');
  const message = parsed.message;

  console.log(message);
};
