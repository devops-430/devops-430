const Queue = require('../backend/src/models/Queue');
const Resource = require('../backend/src/models/Resource');
const axios = require('axios');

const EXECUTOR_API_URL = process.env.EXECUTOR_API_URL || 'http://localhost:5000';

class QueueExecutor {
  constructor() {
    this.isRunning = false;
    this.pollInterval = 5000; // 5 seconds
    this.maxConcurrent = 3;
    this.currentTasks = new Set();
    this.apiUrl = EXECUTOR_API_URL;
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
    let resource;
    
    try {
      // Check if there are any resources with null instanceId
      const existingResources = await Resource.find({ instanceId: null });
      
      // If there are existing resources with null instanceId, increment the name
      let resourceName = name;
      if (existingResources.length > 0) {
        // Find the highest number suffix
        let maxSuffix = 0;
        existingResources.forEach(resource => {
          const match = resource.name.match(/_(\d+)$/);
          if (match) {
            const suffix = parseInt(match[1], 10);
            if (suffix > maxSuffix) {
              maxSuffix = suffix;
            }
          }
        });
        
        // Add or increment the suffix
        if (maxSuffix > 0) {
          resourceName = `${name}_${maxSuffix + 1}`;
        } else {
          resourceName = `${name}_2`;
        }
        
        console.log(`Using incremented name: ${resourceName}`);
      }
      
      // Create resource in MongoDB first with pending status
      resource = await Resource.create({
        name: resourceName,
        instanceType,
        osVersion,
        status: 'pending',
        instanceId: null  // Explicitly set to null
      });

      // Call Python executor API to create EC2 instance
      const response = await axios.post(`${this.apiUrl}/create`, {
        instance_type: instanceType,
        os_version: osVersion
      });

      const { instance_id, public_ip, username, password } = response.data;

      // Update resource with EC2 instance details
      resource = await Resource.findByIdAndUpdate(
        resource._id,
        {
          instanceId: instance_id,
          publicIp: public_ip,
          username,
          password,
          status: 'running'
        },
        { new: true }  // Return the updated document
      );

      await task.markCompleted({ resourceId: resource._id });
    } catch (error) {
      console.error('Error in createResource:', error);
      // If we have a resource document but EC2 creation failed, update its status
      if (resource?._id) {
        await Resource.findByIdAndUpdate(resource._id, {
          status: 'error',
          error: error.response?.data?.error || 'Failed to create EC2 instance'
        });
      }
      throw error;
    }
  }

  async handleDeleteResource(task) {
    const { resourceId } = task.payload;
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Call Python executor API to terminate EC2 instance
    await axios.delete(`${this.apiUrl}/instance/${resource.instanceId}`);

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
    const response = await axios.post(`${this.apiUrl}/start/${resource.instanceId}`);
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
    await axios.post(`${this.apiUrl}/stop/${resource.instanceId}`);

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
    const response = await axios.post(`${this.apiUrl}/restart/${resource.instanceId}`);
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