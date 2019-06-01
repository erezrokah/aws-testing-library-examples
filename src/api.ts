import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export const endpoint: Handler = (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  callback(null, {
    body: JSON.stringify({
      message: 'Hi ⊂◉‿◉つ from API',
    }),
    headers: {
      /* Required for cookies, authorization headers with HTTPS */
      'Access-Control-Allow-Credentials': true,
      /* Required for CORS support to work */
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
  });
};
