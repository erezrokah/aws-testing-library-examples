import { APIGatewayEvent, Handler } from 'aws-lambda';

export const log: Handler = async (event: APIGatewayEvent) => {
  const parsed = JSON.parse(event.body || '');
  const message = parsed.message;

  console.log(message);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message,
    }),
  };
};
