const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');
const { resolveLocationId } = require('../utils/locationHelper');
const { computeDijkstra } = require('../services/dijkstra');

const router = express.Router();

// Create new shipment order
router.post('/orders', async (req, res) => {
  try {
    const { source, destination, urgency, deadline, distance } = req.body;
    const locations = await mysqlService.getLocations();
    const srcId = await resolveLocationId(source, locations);
    const dstId = await resolveLocationId(destination, locations);

    const order = await mysqlService.addOrder(srcId, dstId, urgency || 'Medium', deadline, distance || 0);

    // Create NoSQL tracking document in MongoDB
    await mongoService.upsertOrderTracking(order.id, {
      orderId: order.id,
      source: srcId,
      destination: dstId,
      status: 'Pending',
      urgency: order.urgency,
      timeline: [
        { status: 'Pending', timestamp: new Date().toISOString(), note: 'Order registered in queue' }
      ]
    });

    await mongoService.logActivity(`Order created: #${order.id} (${srcId} -> ${dstId})`, 'INFO', { orderId: order.id });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders queue and status map
router.get('/orders', async (req, res) => {
  try {
    const orders = await mysqlService.getOrders();
    const queue = orders.filter(o => o.status === 'Pending');
    const statuses = {};
    orders.forEach(o => {
      statuses[o.id] = o.status;
    });
    res.json({ statuses, queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process next pending order by Priority Queue + Dijkstra
router.post('/process-order', async (req, res) => {
  try {
    const locations = await mysqlService.getLocations();
    const edges = await mysqlService.getEdges();
    const orders = await mysqlService.getOrders();
    const pendingOrders = orders.filter(o => o.status === 'Pending');

    if (pendingOrders.length === 0) {
      return res.status(404).json({ error: 'No pending orders in queue' });
    }

    // Priority Queue: Critical (4) > High (3) > Medium (2) > Low (1), then by lowest ID
    const urgencyWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    pendingOrders.sort((a, b) => {
      const weightA = urgencyWeights[a.urgency] || 2;
      const weightB = urgencyWeights[b.urgency] || 2;
      if (weightB !== weightA) return weightB - weightA;
      return a.id - b.id;
    });

    const nextOrder = pendingOrders[0];
    const route = computeDijkstra(locations, edges, nextOrder.source, nextOrder.destination);
    nextOrder.status = 'Delivered';

    // Update status in MySQL database
    await mysqlService.updateOrderStatus(nextOrder.id, 'Delivered');

    // Upsert full route tracking document into MongoDB
    await mongoService.upsertOrderTracking(nextOrder.id, {
      orderId: nextOrder.id,
      source: nextOrder.source,
      destination: nextOrder.destination,
      status: 'Delivered',
      route,
      completedAt: new Date().toISOString()
    });

    // Append log event in MongoDB activity_logs
    await mongoService.logActivity(
      `Order #${nextOrder.id} (${nextOrder.urgency} Priority) processed & delivered via Dijkstra (${route.distance} km)`,
      'SUCCESS',
      { order: nextOrder, route }
    );

    res.json({ order: nextOrder, route });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
