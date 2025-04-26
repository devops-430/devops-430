const mongoose = require('mongoose');
require('dotenv').config();

async function dropResourceIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the Resource collection
    const Resource = require('./models/Resource');
    const collection = Resource.collection;

    // Drop all indexes except _id
    await collection.dropIndexes();
    console.log('Dropped all indexes on Resource collection');

    // Verify indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    console.log('Index drop completed successfully');
  } catch (error) {
    console.error('Error dropping indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the drop
dropResourceIndexes(); 