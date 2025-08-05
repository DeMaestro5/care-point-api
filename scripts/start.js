#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

// Simple startup script that doesn't rely on dotenv
const path = require('path');

// Set default environment variables if not present
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

if (!process.env.PORT) {
  process.env.PORT = '3000';
}

console.log('Starting Care Point API...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Load the built application
try {
  require(path.join(__dirname, '..', 'build', 'server.js'));
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
