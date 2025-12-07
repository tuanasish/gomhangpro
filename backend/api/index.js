// Vercel Serverless Function entry point for backend
// This file imports the Express app from the built dist/server.js

// Since package.json has "type": "module", we use ES module syntax
// Import the compiled server.js which exports the Express app as default
import serverModule from '../dist/server.js';

// Vercel expects a default export function that handles requests
export default serverModule;
