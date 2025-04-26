const mongoose = require('mongoose');
require('dotenv').config();

async function fixResourceIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the Resource collection
    const Resource = mongoose.model('Resource');
    const collection = Resource.collection;

    // Drop the existing index
    try {
      await collection.dropIndex('instanceId_1');
      console.log('Dropped existing instanceId index');
    } catch (error) {
      console.log('No existing index to drop');
    }

    // Create new sparse index
    await collection.createIndex(
      { instanceId: 1 },
      { 
        unique: true,
        sparse: true,
        name: 'instanceId_1'
      }
    );
    console.log('Created new sparse index on instanceId');

    // Verify the index
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixResourceIndex(); 