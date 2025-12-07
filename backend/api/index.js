// Vercel Serverless Function entry point for backend
const server = require('../dist/server.js');

module.exports = server.default || server;

