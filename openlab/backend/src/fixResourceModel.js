const mongoose = require('mongoose');
require('dotenv').config();

async function fixResourceModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the Resource collection
    const Resource = require('./models/Resource');
    const collection = Resource.collection;

    // Drop the existing index
    try {
      await collection.dropIndex('instanceId_1');
      console.log('Dropped existing instanceId index');
    } catch (error) {
      console.log('No existing index to drop or error dropping index:', error.message);
    }

    // Update the Resource model schema
    const ResourceSchema = mongoose.model('Resource').schema;
    
    // Remove the unique constraint from instanceId
    if (ResourceSchema.path('instanceId')) {
      ResourceSchema.path('instanceId').options.unique = false;
      console.log('Removed unique constraint from instanceId field');
    }

    // Delete the model to force recompilation
    delete mongoose.models.Resource;
    
    // Recreate the model with updated schema
    const UpdatedResource = mongoose.model('Resource', ResourceSchema);
    console.log('Recreated Resource model with updated schema');

    // Verify the model
    const model = mongoose.model('Resource');
    console.log('InstanceId field options:', model.schema.path('instanceId').options);

    console.log('Resource model fix completed successfully');
  } catch (error) {
    console.error('Error fixing Resource model:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixResourceModel(); 