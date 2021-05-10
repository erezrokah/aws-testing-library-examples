/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const gitRemoteOriginUrl = require('git-remote-origin-url');
const yargs = require('yargs');
const { Octokit } = require('@octokit/rest');
const { IAM } = require('aws-sdk');
const sodium = require('tweetsodium');

const extractGithubData = async () => {
  const url = await gitRemoteOriginUrl();
  // https://github.com/USERNAME/REPOSITORY.git
  // or
  // git@github.com:USERNAME/REPOSITORY.git
  // to USERNAME/REPOSITORY.git
  const stripped = url.split('github.com')[1].substring(1);

  // splits USERNAME/REPOSITORY.git
  const parts = stripped.split('/');
  const owner = parts[0];
  const repo = parts[1].split('.')[0];

  return {
    owner,
    repo,
  };
};

const { log, error } = console;

const policyArn = 'arn:aws:iam::aws:policy/AdministratorAccess';

const getIamUserName = ({ owner, repo }) => `github-actions-${owner}-${repo}`;

const deleteAllKeys = async (userName) => {
  log(`Deleting all access keys for user ${userName}`);
  const iam = new IAM();
  const result = await iam.listAccessKeys({ UserName: userName }).promise();

  await Promise.all(
    result.AccessKeyMetadata.map(({ UserName, AccessKeyId }) =>
      iam.deleteAccessKey({ UserName, AccessKeyId }).promise(),
    ),
  );
  log(`Done deleting all access keys for user ${userName}`);
};

const createIamUser = async (userName) => {
  const iam = new IAM();

  try {
    log(`Creating IAM user ${userName}`);
    await iam.createUser({ UserName: userName }).promise();
    log(`Done creating IAM user ${userName}`);
  } catch (e) {
    if (e.code === 'EntityAlreadyExists') {
      log(`User ${userName} already exists`);
      await deleteAllKeys(userName);
    } else {
      throw e;
    }
  }

  log(`Attaching managed policy to user ${userName}`);
  await iam
    .attachUserPolicy({
      PolicyArn: policyArn,
      UserName: userName,
    })
    .promise();
  log(`Done attaching managed policy to user ${userName}`);

  log(`Creating access key for user ${userName}`);
  const { AccessKey } = await iam
    .createAccessKey({ UserName: userName })
    .promise();
  const { AccessKeyId: accessKeyId, SecretAccessKey: secretAccessKey } =
    AccessKey;
  log(`Done creating access key for user ${userName}`);
  return { accessKeyId, secretAccessKey };
};

const deleteIamUser = async (userName) => {
  const iam = new IAM();

  try {
    log(`Detaching IAM user ${userName} policy ${policyArn}`);
    await iam
      .detachUserPolicy({
        PolicyArn: policyArn,
        UserName: userName,
      })
      .promise();
    log(`Done detaching IAM user ${userName} policy ${policyArn}`);

    await deleteAllKeys(userName);

    log(`Deleting IAM user ${userName}`);
    await iam.deleteUser({ UserName: userName }).promise();
    log(`Done deleting IAM user ${userName}`);
  } catch (e) {
    if (e.code === 'NoSuchEntity') {
      log(`Policy ${policyArn} doesn't exists`);
    } else {
      throw e;
    }
  }
};

const setupGitHubSecrets = async ({ owner, repo, token, secrets }) => {
  log('Setting up repo secrets');

  const octokit = new Octokit({ auth: token });

  const {
    data: { key, key_id },
  } = await octokit.actions.getRepoPublicKey({ owner, repo });

  await Promise.all(
    secrets.map(async ({ name, value }) => {
      const messageBytes = Buffer.from(value);
      const keyBytes = Buffer.from(key, 'base64');
      const encryptedBytes = sodium.seal(messageBytes, keyBytes);
      const encrypted = Buffer.from(encryptedBytes).toString('base64');

      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        key_id,
        secret_name: name,
        encrypted_value: encrypted,
      });
    }),
  );

  log('Done setting up repo secrets');
};

const deleteGitHubSecrets = async ({ owner, repo, token, secrets }) => {
  log('Removing up repo secrets');
  const octokit = new Octokit({ auth: token });
  await Promise.all(
    secrets.map(async ({ name }) => {
      await octokit.actions.deleteRepoSecret({
        owner,
        repo,
        secret_name: name,
      });
    }),
  );

  log('Done removing up repo secrets');
};

const setup = async ({ token }) => {
  try {
    const { owner, repo } = await extractGithubData();
    const iamUser = getIamUserName({ owner, repo });
    const { accessKeyId, secretAccessKey } = await createIamUser(iamUser);

    const secrets = [
      { name: 'AWS_ACCESS_KEY_ID', value: accessKeyId },
      { name: 'AWS_SECRET_ACCESS_KEY', value: secretAccessKey },
    ];
    await setupGitHubSecrets({ owner, repo, token, secrets });
  } catch (e) {
    error(e);
    process.exit(1);
  }
};

const remove = async ({ token }) => {
  try {
    const { owner, repo } = extractGithubData();
    const iamUser = getIamUserName({ owner, repo });
    const secrets = [
      { name: 'AWS_ACCESS_KEY_ID' },
      { name: 'AWS_SECRET_ACCESS_KEY' },
    ];
    await deleteGitHubSecrets({ owner, repo, token, secrets });
    await deleteIamUser(iamUser);
  } catch (e) {
    error(e);
    process.exit(1);
  }
};

yargs
  .command({
    command: 'setup',
    aliases: ['s'],
    desc: 'Setup GitHub Action',
    builder: (yargs) =>
      yargs.option('token', {
        alias: 't',
        describe: 'Api Token',
        demandOption: true,
        string: true,
        requiresArg: true,
      }),
    handler: async ({ token }) => {
      await setup({ token });
    },
  })
  .command({
    command: 'remove',
    aliases: ['r'],
    desc: 'Cleanup GitHub Action',
    builder: (yargs) =>
      yargs.option('token', {
        alias: 't',
        describe: 'Api Token',
        demandOption: true,
        string: true,
        requiresArg: true,
      }),
    handler: async ({ token }) => {
      await remove({ token });
    },
  })
  .demandCommand(1)
  .help()
  .strict()
  .version('0.0.1').argv;
