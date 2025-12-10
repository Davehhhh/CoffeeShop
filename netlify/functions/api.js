// Netlify serverless function wrapper for Express app
const serverless = require('serverless-http');
const app = require('../../src/app');

const handler = serverless(app);

exports.handler = async (event, context) => {
  return handler(event, context);
};
