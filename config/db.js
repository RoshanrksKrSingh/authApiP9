const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
console.log('ENV MONGO_URI =', process.env.MONGO_URI);

const connectDB = async () => {
  try {
       let mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri); 
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
