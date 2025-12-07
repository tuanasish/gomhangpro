// Vercel Serverless Function - Catch-all for /api/* routes
// This will handle all API requests and forward to Express app

const express = require('express');
const cors = require('cors');

let app = null;

function createApp() {
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
  // Lưu ý: Cần import từ backend/dist sau khi build
  try {
    // Dynamic import routes
    const path = require('path');
    const fs = require('fs');
    const backendDistPath = path.join(__dirname, '../backend/dist');
    
    if (fs.existsSync(backendDistPath)) {
      const authRoutes = require(path.join(backendDistPath, 'routes/auth.routes.js')).default;
      const staffRoutes = require(path.join(backendDistPath, 'routes/staff.routes.js')).default;
      const customersRoutes = require(path.join(backendDistPath, 'routes/customers.routes.js')).default;
      const countersRoutes = require(path.join(backendDistPath, 'routes/counters.routes.js')).default;
      const shiftsRoutes = require(path.join(backendDistPath, 'routes/shifts.routes.js')).default;
      const ordersRoutes = require(path.join(backendDistPath, 'routes/orders.routes.js')).default;
      
      app.use('/api/auth', authRoutes);
      app.use('/api/staff', staffRoutes);
      app.use('/api/customers', customersRoutes);
      app.use('/api/counters', countersRoutes);
      app.use('/api/shifts', shiftsRoutes);
      app.use('/api/orders', ordersRoutes);
    }
  } catch (error) {
    console.error('Error loading routes:', error);
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
  const expressApp = createApp();
  return expressApp(req, res);
};

