import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';

// Load environment variables từ file .env trong backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gom Hàng Pro API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
import authRoutes from './routes/auth.routes';
import staffRoutes from './routes/staff.routes';
import customersRoutes from './routes/customers.routes';
import countersRoutes from './routes/counters.routes';
import shiftsRoutes from './routes/shifts.routes';
import ordersRoutes from './routes/orders.routes';
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/counters', countersRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/orders', ordersRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  
  // Test Supabase connection if credentials are provided
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { testSupabaseConnection } = await import('./config/supabase');
      await testSupabaseConnection();
    } catch (error: any) {
      console.log('⚠️  Supabase connection failed:', error?.message || error);
    }
  } else {
    console.log('⚠️  Supabase credentials not found');
  }
});

