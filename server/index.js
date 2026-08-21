const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const rtiRouter = require('./routes/rti');
const rightsRouter = require('./routes/rights');
const authRouter = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  res.json({ status: 'ok', service: 'Adhikaar Express Backend', db: dbStatus });
});

app.use('/api/rti', rtiRouter);
app.use('/api/rights', rightsRouter);
app.use('/api/auth', authRouter);

// Global Error Handler
app.use(errorHandler);

// Start HTTP server immediately — do NOT wait for MongoDB
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express Backend] Server running on http://localhost:${PORT}`);
});

// Attempt MongoDB connection in the background (non-blocking)
async function connectMongo() {
  if (!MONGO_URI) {
    console.warn('[MongoDB] MONGO_URI is not set — skipping database connection. AI & Auth routes will operate in resilient mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log(`[MongoDB] Connected successfully to database: ${conn.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Connection notice: ${err.message}`);
    console.warn('[MongoDB] AI & Auth routes will operate in high-availability mode without blocking users.');
    setTimeout(connectMongo, 30000);
  }
}

connectMongo();

