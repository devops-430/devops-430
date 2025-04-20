require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixUserModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update the schema to make name and password optional
    User.schema.path('name').required = false;
    User.schema.path('password').required = false;

    // Recompile the model
    mongoose.deleteModel('User');
    const UpdatedUser = mongoose.model('User', User.schema);

    console.log('User model updated successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing User model:', error);
  }
}

fixUserModel(); 