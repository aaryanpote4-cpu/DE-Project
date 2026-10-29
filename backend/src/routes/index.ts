import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Graph, Location } from '../dataStructures/Graph';
import { OrderManager, Order } from '../dataStructures/OrderManager';
import * as dotenv from 'dotenv';
import { dijkstra } from '../algorithms/dijkstra';

dotenv.config();

const router = Router();

// In-memory DSA state
const graph = new Graph();
const orderManager = new OrderManager();

// In-memory "Database"
const dbLocations: any[] = [];
const dbEdges: any[] = [];
const dbInventory: any[] = [];

// Routes
// 1. Add Location
router.post('/locations', async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    const newLocation = { id: randomUUID(), name, lat, lng };
    dbLocations.push(newLocation);
    graph.addVertex(newLocation.id);
    res.json(newLocation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Locations
router.get('/locations', async (req, res) => {
  try {
    res.json(dbLocations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add Edge
router.post('/edges', async (req, res) => {
  try {
    const { source, destination, distance } = req.body;
    const newEdge = { id: randomUUID(), source, destination, distance };
    dbEdges.push(newEdge);
    graph.addEdge(source, destination, distance);
    res.json(newEdge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get Edges
router.get('/edges', async (req, res) => {
  try {
    res.json(dbEdges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Create Order
router.post('/orders', async (req, res) => {
  try {
    const { source, destination } = req.body;
    const order: Order = { id: randomUUID(), source, destination, status: 'Pending' };
    orderManager.addOrder(order);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Orders
router.get('/orders', async (req, res) => {
  try {
    const statuses = orderManager.getAllOrderStatuses();
    const queue = orderManager.getPendingQueue();
    res.json({ statuses, queue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get Shortest Path
router.get('/shortest-path', (req, res) => {
  try {
    const { source, destination } = req.query;
    if (typeof source !== 'string' || typeof destination !== 'string') {
      return res.status(400).json({ error: 'Source and destination must be strings' });
    }
    const result = dijkstra(graph, source, destination);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Process Order
router.post('/process-order', async (req, res) => {
  try {
    const order = orderManager.getNextOrder();
    if (!order) {
      return res.status(404).json({ error: 'No pending orders in the queue' });
    }

    orderManager.updateOrderStatus(order.id, 'In Transit');
    
    // Simulate Dijkstra
    const route = dijkstra(graph, order.source, order.destination);

    // Update in DB
    orderManager.updateOrderStatus(order.id, 'Delivered');

    res.json({ order, route });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Get Inventory
router.get('/inventory', async (req, res) => {
  try {
    res.json(dbInventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Add Inventory Item
router.post('/inventory', async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const newItem = { id: randomUUID(), name, quantity: Number(quantity), price: Number(price) };
    dbInventory.push(newItem);
    res.json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Buy Item (Increase Stock)
router.post('/inventory/buy', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = dbInventory.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.quantity += Number(quantity);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Sell Item (Decrease Stock)
router.post('/inventory/sell', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = dbInventory.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.quantity < Number(quantity)) return res.status(400).json({ error: 'Not enough stock to sell' });
    item.quantity -= Number(quantity);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
