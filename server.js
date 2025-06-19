const dotenv = require('dotenv').config();
const app = require('./app');

const connectDB = require('./config/db');

const cors = require('cors');
app.use(cors());
app.use(cors({
  origin: "*",//'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
