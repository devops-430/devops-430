const Resource = require('../models/Resource');
const Queue = require('../models/Queue');

class ResourceController {
  async createResource(req, res) {
    try {
      console.log('Creating resource with payload:', req.body);

      const { name, type } = req.body;

      // Set default values for EC2 instances
      const instanceType = 'nano';  // Default to smallest instance
      const osVersion = 'ubuntu22.04';  // Default to LTS version

      // Create a pending resource
      console.log('Creating Resource document...');
      const resource = await Resource.create({
        name,
        instanceType,
        osVersion,
        status: 'pending'
      });
      console.log('Resource created:', resource);

      // Queue the creation task
      console.log('Creating Queue task...');
      const queueTask = await Queue.create({
        type: 'CREATE_RESOURCE',
        payload: {
          name,
          instanceType,
          osVersion
        },
        resourceId: resource._id
      });
      console.log('Queue task created:', queueTask);

      res.json({
        message: 'Resource creation queued',
        resourceId: resource._id,
        status: 'pending',
        details: {
          name,
          instanceType,
          osVersion
        }
      });
    } catch (error) {
      console.error('Error in createResource:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async startResource(req, res) {
    try {
      const { resourceId } = req.params;
      
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Queue the start task
      await Queue.create({
        type: 'START_RESOURCE',
        payload: { resourceId },
        resourceId: resource._id
      });

      res.json({
        message: 'Resource start queued',
        resourceId: resource._id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async stopResource(req, res) {
    try {
      const { resourceId } = req.params;
      
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Queue the stop task
      await Queue.create({
        type: 'STOP_RESOURCE',
        payload: { resourceId },
        resourceId: resource._id
      });

      res.json({
        message: 'Resource stop queued',
        resourceId: resource._id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async restartResource(req, res) {
    try {
      const { resourceId } = req.params;
      
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Queue the restart task
      await Queue.create({
        type: 'RESTART_RESOURCE',
        payload: { resourceId },
        resourceId: resource._id
      });

      res.json({
        message: 'Resource restart queued',
        resourceId: resource._id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteResource(req, res) {
    try {
      const { resourceId } = req.params;
      
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Queue the delete task
      await Queue.create({
        type: 'DELETE_RESOURCE',
        payload: { resourceId },
        resourceId: resource._id
      });

      res.json({
        message: 'Resource deletion queued',
        resourceId: resource._id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getResources(req, res) {
    try {
      const resources = await Resource.find();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getResource(req, res) {
    try {
      const { resourceId } = req.params;
      const resource = await Resource.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ResourceController(); 