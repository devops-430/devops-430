const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instanceId: {
    type: String,
    default: null
  },
  instanceType: {
    type: String,
    required: true,
    enum: ['nano', 'small', 'medium'],
  },
  osVersion: {
    type: String,
    required: true,
    enum: ['ubuntu22.04', 'ubuntu24.04'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'stopped', 'error'],
    default: 'pending',
  },
  publicIp: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    default: 'ubuntu',
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  error: {
    type: String,
    default: null,
  }
});

// Update the updatedAt timestamp before saving
ResourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource; 