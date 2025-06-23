const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
require('dotenv').config();
const isProd = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));
// app.use(cors({
//   origin: true,             //  Automatically reflect the origin from the request
//   credentials: true         // Allow cookies
// }));

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
    httpOnly: true,
    secure: isProd,                  //  true in prod HTTPS, false in dev HTTP
    sameSite: isProd ? 'none' : 'lax',  //  cross-origin in prod, easier in dev
    maxAge: 10 * 60 * 1000
  }
}));


// Routes
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
