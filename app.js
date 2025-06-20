const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

// JSON body parser middleware
app.use(express.json());

// Express-session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',  // इसे .env में रखें बेहतर
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 60 * 1000,   // 10 minutes
    httpOnly: true,
    secure: false,            // localhost के लिए false, production में true with HTTPS
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
