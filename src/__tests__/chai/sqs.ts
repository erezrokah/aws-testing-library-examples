import * as SNS from 'aws-sdk/clients/sns';
import awsTesting from 'aws-testing-library/lib/chai';
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from 'aws-testing-library/lib/utils/sqs';
import chai = require('chai');
import { readJsonSync } from 'fs-extra';
import path = require('path');

const { NotificationsTopicArn: topicArn, region } = readJsonSync(
  path.join(__dirname, '..', 'config.json'),
);

chai.use(awsTesting);
const { expect } = chai;

describe('sqs/sns', () => {
  describe('chai', () => {
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

      await expect({ region, queueUrl }).to.have.message(
        ({ Subject, Message }) => Subject === subject && Message === message,
      );
    });
  });
});
