const Queue = require('../models/Queue');
const Resource = require('../models/Resource');
const axios = require('axios');

const EXECUTOR_API_URL = process.env.EXECUTOR_API_URL || 'http://localhost:3001';

class QueueExecutor {
  constructor() {
    this.isRunning = false;
    this.pollInterval = 5000; // 5 seconds
    this.maxConcurrent = 3;
    this.currentTasks = new Set();
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.poll();
  }

  stop() {
    this.isRunning = false;
  }

  async poll() {
    while (this.isRunning) {
      try {
        if (this.currentTasks.size < this.maxConcurrent) {
          const task = await Queue.getNextPendingTask();
          if (task) {
            this.currentTasks.add(task._id);
            this.processTask(task).finally(() => {
              this.currentTasks.delete(task._id);
            });
          }
        }
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      } catch (error) {
        console.error('Error in queue executor poll:', error);
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      }
    }
  }

  async processTask(task) {
    try {
      switch (task.type) {
        case 'CREATE_RESOURCE':
          await this.handleCreateResource(task);
          break;
        case 'DELETE_RESOURCE':
          await this.handleDeleteResource(task);
          break;
        case 'START_RESOURCE':
          await this.handleStartResource(task);
          break;
        case 'STOP_RESOURCE':
          await this.handleStopResource(task);
          break;
        case 'RESTART_RESOURCE':
          await this.handleRestartResource(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      console.error(`Error processing task ${task._id}:`, error);
      await task.markFailed(error.message);
    }
  }

  async handleCreateResource(task) {
    const { name, instanceType, osVersion } = task.payload;
    
    // Call Python executor API to create EC2 instance
    const response = await axios.post(`${EXECUTOR_API_URL}/create`, {
      instance_type: instanceType,
      os_version: osVersion
    });

    const { instance_id, public_ip, username, password } = response.data;

    // Create resource in MongoDB
    const resource = await Resource.create({
      name,
      instanceId: instance_id,
      instanceType,
      osVersion,
      publicIp: public_ip,
      username,
      password,
      status: 'running'
    });

    await task.markCompleted({ resourceId: resource._id });
  }

  async handleDeleteResource(task) {
    const { resourceId } = task.payload;
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Call Python executor API to terminate EC2 instance
    await axios.delete(`${EXECUTOR_API_URL}/instance/${resource.instanceId}`);

    // Delete resource from MongoDB
    await Resource.deleteOne({ _id: resourceId });

    await task.markCompleted();
  }

  async handleStartResource(task) {
    const { resourceId } = task.payload;
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Call Python executor API to start EC2 instance
    const response = await axios.post(`${EXECUTOR_API_URL}/start/${resource.instanceId}`);
    const { public_ip } = response.data;

    // Update resource status and IP
    await Resource.updateOne(
      { _id: resourceId },
      { 
        status: 'running',
        publicIp: public_ip
      }
    );

    await task.markCompleted();
  }

  async handleStopResource(task) {
    const { resourceId } = task.payload;
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Call Python executor API to stop EC2 instance
    await axios.post(`${EXECUTOR_API_URL}/stop/${resource.instanceId}`);

    // Update resource status
    await Resource.updateOne(
      { _id: resourceId },
      { 
        status: 'stopped',
        publicIp: null
      }
    );

    await task.markCompleted();
  }

  async handleRestartResource(task) {
    const { resourceId } = task.payload;
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Call Python executor API to restart EC2 instance
    const response = await axios.post(`${EXECUTOR_API_URL}/restart/${resource.instanceId}`);
    const { public_ip } = response.data;

    // Update resource status and IP
    await Resource.updateOne(
      { _id: resourceId },
      { 
        status: 'running',
        publicIp: public_ip
      }
    );

    await task.markCompleted();
  }
}

// Export singleton instance
module.exports = new QueueExecutor(); 