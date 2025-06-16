const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
// const cors= require('cors');
const app = express();
app.use(express.json());
// app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use(errorHandler);

module.exports = app;
