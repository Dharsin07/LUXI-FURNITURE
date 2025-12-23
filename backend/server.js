const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cart');
const wishlistRoutes = require('./src/routes/wishlist');
const orderRoutes = require('./src/routes/orders');

const app = express();

// Enable compression for all responses
app.use(compression());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);

    // Check exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Check localhost patterns
    const isLocalViteOrigin = /^http:\/\/localhost:\d{4,5}$/.test(origin);
    if (isLocalViteOrigin) return callback(null, true);

    // Check Render domains
    const isRenderOrigin = /^https:\/\/.*\.onrender\.com$/.test(origin);
    if (isRenderOrigin) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // higher limit for development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add caching headers for static data
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    if (process.env.NODE_ENV === 'production') {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    } else {
      res.set('Cache-Control', 'no-store');
    }
  }
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../react-app/dist')));

// Routes - Only products for now to test Supabase storage
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../react-app/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler (Express v5 does not support '*' path the same way)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Products API available at /api/products');
});
