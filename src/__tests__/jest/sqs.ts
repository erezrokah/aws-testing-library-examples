import * as SNS from 'aws-sdk/clients/sns';
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from 'aws-testing-library/lib/utils/sqs';
import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { NotificationsTopicArn: topicArn, region } = require(path.join(
  __dirname,
  '..',
  'config.json',
));

describe('sqs/sns', () => {
  describe('jest', () => {
    let [subscriptionArn, queueUrl] = ['', ''];

    beforeEach(async () => {
      ({ subscriptionArn, queueUrl } = await subscribeToTopic(
        region,
        topicArn,
      ));
    });

    afterEach(async () => {
      await unsubscribeFromTopic(region, subscriptionArn, queueUrl);
    });

    test('should update dynamodb and send notification on bad endpoint', async () => {
      const sns = new SNS({ region });

      const date = new Date().toUTCString();
      const subject = 'subject from test ' + date;
      const message = 'message from test ' + date;
      await sns
        .publish({ TopicArn: topicArn, Message: message, Subject: subject })
        .promise();

      expect.assertions(1);

      await expect({ region, queueUrl }).toHaveMessage(
        ({ Subject, Message }) => Subject === subject && Message === message,
      );
    });
  });
});
