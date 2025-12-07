// Vercel Serverless Function - Entry point for Express backend
// Using CommonJS for Vercel compatibility

module.exports = async (req, res) => {
  try {
    // Dynamic import Express app from built backend
    const path = require('path');
    const express = require('express');
    const cors = require('cors');
    const { createServer } = require('./server-handler');
    
    // Get Express app instance
    const app = await createServer();
    
    // Return Express handler
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

