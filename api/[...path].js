// Vercel Serverless Function - Catch-all for /api/* routes
// This will handle all API requests and forward to Express app

const express = require('express');
const cors = require('cors');

let app = null;

async function createApp() {
  if (app) return app;
  
  app = express();
  
  // CORS - allow all origins in production
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Gom Hàng Pro API is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Import và mount routes từ backend
  // Backend build ra ES modules, cần dynamic import
  try {
    const path = require('path');
    const { pathToFileURL } = require('url');
    
    // Sử dụng relative path từ api/ đến backend/dist
    const backendDistPath = path.resolve(__dirname, '../backend/dist');
    
    // Dynamic import ES modules
    const authRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/auth.routes.js')).href);
    const staffRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/staff.routes.js')).href);
    const customersRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/customers.routes.js')).href);
    const countersRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/counters.routes.js')).href);
    const shiftsRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/shifts.routes.js')).href);
    const ordersRoutesModule = await import(pathToFileURL(path.join(backendDistPath, 'routes/orders.routes.js')).href);
    
    app.use('/api/auth', authRoutesModule.default);
    app.use('/api/staff', staffRoutesModule.default);
    app.use('/api/customers', customersRoutesModule.default);
    app.use('/api/counters', countersRoutesModule.default);
    app.use('/api/shifts', shiftsRoutesModule.default);
    app.use('/api/orders', ordersRoutesModule.default);
  } catch (error) {
    console.error('Error loading routes:', error);
    console.error('Error stack:', error.stack);
  }
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`
    });
  });
  
  return app;
}

module.exports = async (req, res) => {
  const expressApp = await createApp();
  return expressApp(req, res);
};

