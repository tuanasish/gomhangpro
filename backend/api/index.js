// Vercel Serverless Function entry point for backend
// This file imports the Express app from the built dist/server.js

// Using dynamic import for ES modules
import('../dist/server.js')
  .then((module) => {
    // Export the default export (Express app) from server.js
    const app = module.default || module;
    module.exports = app;
  })
  .catch((error) => {
    console.error('Error loading server:', error);
    // Fallback: create a simple Express app
    const express = require('express');
    const app = express();
    app.get('*', (req, res) => {
      res.status(500).json({ error: 'Failed to load server', message: error.message });
    });
    module.exports = app;
  });

// For Vercel, we need to use CommonJS export
// The app will be loaded asynchronously
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy load routes
let routesLoaded = false;

async function loadRoutes() {
  if (routesLoaded) return;
  
  try {
    const path = require('path');
    const { pathToFileURL } = require('url');
    const backendDistPath = path.resolve(__dirname, '../dist');
    
    // Dynamic import ES modules
    const authRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/auth.routes.js')).href)).default;
    const staffRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/staff.routes.js')).href)).default;
    const customersRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/customers.routes.js')).href)).default;
    const countersRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/counters.routes.js')).href)).default;
    const shiftsRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/shifts.routes.js')).href)).default;
    const ordersRoutes = (await import(pathToFileURL(path.join(backendDistPath, 'routes/orders.routes.js')).href)).default;
    
    app.use('/api/auth', authRoutes);
    app.use('/api/staff', staffRoutes);
    app.use('/api/customers', customersRoutes);
    app.use('/api/counters', countersRoutes);
    app.use('/api/shifts', shiftsRoutes);
    app.use('/api/orders', ordersRoutes);
    
    routesLoaded = true;
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gom Hàng Pro API is running',
    timestamp: new Date().toISOString()
  });
});

// Load routes before handling requests
app.use(async (req, res, next) => {
  await loadRoutes();
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;
