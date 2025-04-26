const express = require('express');
const router = express.Router();

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    // Return an empty array instead of an error
    res.json([]);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

module.exports = router; 