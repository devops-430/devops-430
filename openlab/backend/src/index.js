require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const resourcesRoutes = require('./routes/resources');
const path = require('path');

// Log environment variables (excluding sensitive data)
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER ? 'Present' : 'Missing');
console.log('SMTP_FROM:', process.env.SMTP_FROM);

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB connection string is not provided in environment variables');
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit if database connection fails
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourcesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Start server only after database connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}); 