const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');
const { resolveLocationId } = require('../utils/locationHelper');

const router = express.Router();

// Get all graph edges
router.get('/', async (req, res) => {
  try {
    const edges = await mysqlService.getEdges();
    res.json(edges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an edge connection
router.post('/', async (req, res) => {
  try {
    const { source, destination, distance } = req.body;
    const locations = await mysqlService.getLocations();
    const srcId = await resolveLocationId(source, locations);
    const dstId = await resolveLocationId(destination, locations);

    const edge = await mysqlService.addEdge(srcId, dstId, distance);
    await mongoService.logActivity(`Route connected: ${srcId} -> ${dstId} (${distance} km)`, 'INFO', { edge });
    res.json(edge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
