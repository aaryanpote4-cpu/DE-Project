const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');
const { resolveLocationId } = require('../utils/locationHelper');
const { computeDijkstra } = require('../services/dijkstra');

const router = express.Router();

// Get shortest path between two points
router.get('/shortest-path', async (req, res) => {
  try {
    const { source, destination } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ error: 'Missing source or destination query parameters' });
    }

    const locations = await mysqlService.getLocations();
    const edges = await mysqlService.getEdges();
    const srcId = await resolveLocationId(source, locations);
    const dstId = await resolveLocationId(destination, locations);

    const result = computeDijkstra(locations, edges, srcId, dstId);

    await mongoService.logActivity(
      `Shortest path calculated for ${srcId} -> ${dstId}: ${result.distance} km`,
      'INFO',
      { result }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
