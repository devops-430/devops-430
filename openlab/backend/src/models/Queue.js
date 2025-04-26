const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['CREATE_RESOURCE', 'DELETE_RESOURCE', 'START_RESOURCE', 'STOP_RESOURCE', 'RESTART_RESOURCE']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  error: {
    type: String,
    default: null
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
QueueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get next pending task
QueueSchema.statics.getNextPendingTask = async function() {
  const task = await this.findOneAndUpdate(
    { status: 'pending' },
    { status: 'processing' },
    { 
      sort: { createdAt: 1 },
      new: true
    }
  );
  return task;
};

// Instance method to mark task as completed
QueueSchema.methods.markCompleted = async function(result = {}) {
  this.status = 'completed';
  this.result = result;
  await this.save();
};

// Instance method to mark task as failed
QueueSchema.methods.markFailed = async function(error) {
  this.status = 'failed';
  this.error = error;
  await this.save();
};

const Queue = mongoose.model('Queue', QueueSchema);

module.exports = Queue; 