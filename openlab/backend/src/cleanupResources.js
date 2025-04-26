const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the Resource model
    const Resource = require('./models/Resource');

    // Find all resources with null instanceId
    const nullInstanceResources = await Resource.find({ instanceId: null });
    console.log(`Found ${nullInstanceResources.length} resources with null instanceId`);
    
    if (nullInstanceResources.length > 0) {
      console.log('These resources are:');
      nullInstanceResources.forEach(resource => {
        console.log(`- ID: ${resource._id}, Name: ${resource.name}, Status: ${resource.status}`);
      });
      
      // Delete these resources
      await Resource.deleteMany({ instanceId: null });
      console.log('Deleted all resources with null instanceId');
    }

    console.log('Resource cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupResources(); 