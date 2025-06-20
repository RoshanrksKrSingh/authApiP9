const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,               
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
    secure: true,     
    sameSite: 'none'    
  }
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
