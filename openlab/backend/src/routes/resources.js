const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/ResourceController');

// GET all resources
router.get('/', ResourceController.getResources);

// GET single resource
router.get('/:resourceId', ResourceController.getResource);

// POST create new resource
router.post('/', ResourceController.createResource);

// POST start resource
router.post('/:resourceId/start', ResourceController.startResource);

// POST stop resource
router.post('/:resourceId/stop', ResourceController.stopResource);

// POST restart resource
router.post('/:resourceId/restart', ResourceController.restartResource);

// DELETE resource
router.delete('/:resourceId', ResourceController.deleteResource);

module.exports = router; 