const User = require('../models/UserFixed');
const nodemailer = require('nodemailer');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with just email
      user = new User({ email });
      await user.save();
    }

    // Generate new API key
    const apiKey = user.generateApiKey();
    await user.save();

    // Send API key via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your API Key',
      text: `Your API key is: ${apiKey}`
    });

    res.status(200).json({ message: 'API key sent to your email' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Error processing subscription' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error processing login' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.status(200).json({ valid: true, message: 'API key is valid' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Error verifying API key' });
  }
}; 