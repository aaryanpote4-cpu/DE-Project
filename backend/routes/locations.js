const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');

const router = express.Router();

// Get all graph locations
router.get('/', async (req, res) => {
  try {
    const locations = await mysqlService.getLocations();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a location vertex
router.post('/', async (req, res) => {
  try {
    const { name, lat, lng, code } = req.body;
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, lat, and lng are required' });
    }
    const location = await mysqlService.addLocation(name, lat, lng, code);
    await mongoService.logActivity(`Location added: ${name} (ID: ${location.id})`, 'INFO', { location });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
