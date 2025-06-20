const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

// JSON body parser middleware
app.use(express.json());

// MongoDB-backed session setup using connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false, // Better for production
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions', // Optional
    ttl: 60 * 10 // ⏱️ 10 minutes session expiry
  }),
  cookie: {
    maxAge: 10 * 60 * 1000, // 10 minutes
    httpOnly: true,
    secure: false,          // Set true in production (HTTPS)
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
