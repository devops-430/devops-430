const express = require('express');
const router = express.Router();
const User = require('../models/UserNew');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// In-memory storage for testing
const users = new Map();

// Verify API key
router.post('/verify', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }
    
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }
    
    res.json({ valid: true, message: 'API key is valid' });
  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({ message: 'Error verifying API key' });
  }
});

// Subscribe and get API key
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user with just email
    user = new User({
      email,
      // Name will be auto-generated from email
      // Password is optional
    });

    // Generate API key
    user.generateApiKey();

    // Save user
    await user.save();

    // Send API key via email
    try {
      await emailService.sendApiKey(email, user.apiKey);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails - we'll return the API key in the response
    }

    res.status(200).json({ 
      message: 'API key sent to your email',
      apiKey: user.apiKey // For testing purposes, we'll return the API key in the response
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Error processing subscription' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name: name || email.split('@')[0],
      email,
      password
    });

    // Generate API key
    user.generateApiKey();

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      apiKey: user.apiKey
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      apiKey: user.apiKey
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const testApiKey = 'test-api-key-123';
    
    await emailService.sendApiKey(email, testApiKey);
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Error sending test email' });
  }
});

module.exports = router; 