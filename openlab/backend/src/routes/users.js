const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateApiKey } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, name });
    const apiKey = user.generateApiKey();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      apiKey,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Get user profile
router.get('/profile', authenticateApiKey, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Regenerate API key
router.post('/regenerate-key', authenticateApiKey, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newApiKey = user.generateApiKey();
    await user.save();

    res.json({
      message: 'API key regenerated successfully',
      apiKey: newApiKey
    });
  } catch (error) {
    res.status(500).json({ error: 'Error regenerating API key' });
  }
});

module.exports = router; 