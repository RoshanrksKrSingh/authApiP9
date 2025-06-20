const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

// CORS Setup (adjust origin as needed)
app.use(cors({
  origin: 'http://localhost:3000', // frontend ka origin ya Render ka domain
  credentials: true,               // cookies 
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// JSON body parser middleware
app.use(express.json());

// Session Setup (Mongo-backed)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 60 * 10
  }),
  cookie: {
    maxAge: 10 * 60 * 1000,
    httpOnly: true,
    secure: false, // production me true (HTTPS)
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
