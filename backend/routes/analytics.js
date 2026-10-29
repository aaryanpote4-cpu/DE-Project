const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');

const router = express.Router();

// Get recent activity logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const logs = await mongoService.getActivityLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order tracking timeline
router.get('/tracking/:orderId', async (req, res) => {
  try {
    const tracking = await mongoService.getOrderTracking(req.params.orderId);
    if (!tracking) return res.status(404).json({ error: 'Tracking record not found' });
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Database Schema & Tables Snapshot (Presentation / Demo)
router.get('/admin/database-view', async (req, res) => {
  try {
    const snapshot = await mysqlService.getDatabaseSnapshot();
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Platform Health Check
router.get('/health', async (req, res) => {
  const mysqlStatus = mysqlService.isAvailable() ? 'Connected' : 'Offline / In-Memory Fallback';
  const mongoStatus = mongoService.isAvailable() ? 'Connected' : 'Offline / In-Memory Fallback';

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databases: {
      mysql: { status: mysqlStatus, entities: ['warehouses', 'inventory', 'orders', 'edges', 'users'] },
      mongodb: { status: mongoStatus, collections: ['inventory', 'activity_logs', 'order_tracking'] }
    },
    routingEngine: {
      type: 'Native JavaScript Dijkstra Engine',
      status: 'Operational'
    }
  });
});

module.exports = router;
