const path = require('path');
const os = require('os');

const handler = async (data, serverless, _) => {
  console.log(data);
};

module.exports = { handler };
