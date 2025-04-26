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

router.post('/', async (req, res) => {
  try {
    //respond with a dummy success
    console.log('Received POST /api/resources with body:', req.body);

    //later create/save resource in DB
    res.status(201).json({ message: 'Resource created successfully!' });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Error creating resource' });
  }
});


module.exports = router; 