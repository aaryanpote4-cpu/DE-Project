const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');

const router = express.Router();

// Get all warehouses (Indian network nodes)
router.get('/', async (req, res) => {
  try {
    const raw = await mysqlService.getWarehouses();
    const valid = raw.filter(w => {
      const lat = parseFloat(w.lat);
      const lng = parseFloat(w.lng);
      const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
      if (!isValid) {
        console.warn(`[Warehouse Warning] Skipping warehouse ${w.name} (ID: ${w.id}) with invalid coordinates: ${w.lat}, ${w.lng}`);
      }
      return isValid;
    }).map(w => {
      const total = parseInt(w.total_capacity_sqft, 10) || 50000;
      const used = parseInt(w.used_capacity_sqft, 10) || 0;
      const utilization = Math.min(100, Math.round((used / total) * 100));
      let status = w.status;
      if (!status || status === 'available') {
        if (utilization >= 90) status = 'full';
        else if (utilization >= 70) status = 'near_full';
        else status = 'available';
      }
      return {
        ...w,
        lat: parseFloat(w.lat),
        lng: parseFloat(w.lng),
        total_capacity_sqft: total,
        used_capacity_sqft: used,
        utilization,
        status
      };
    });
    res.json(valid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single warehouse by ID
router.get('/:id', async (req, res) => {
  try {
    const w = await mysqlService.getWarehouseById(req.params.id);
    if (!w) return res.status(404).json({ error: 'Warehouse not found' });
    const total = parseInt(w.total_capacity_sqft, 10) || 50000;
    const used = parseInt(w.used_capacity_sqft, 10) || 0;
    res.json({
      ...w,
      lat: parseFloat(w.lat),
      lng: parseFloat(w.lng),
      total_capacity_sqft: total,
      used_capacity_sqft: used,
      utilization: Math.min(100, Math.round((used / total) * 100))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory for a specific warehouse
router.get('/:id/inventory', async (req, res) => {
  try {
    const items = await mysqlService.getWarehouseInventory(req.params.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add inventory item to a specific warehouse
router.post('/:id/inventory', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id, 10);
    const { name, sku, category, quantity, unit_price, status } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }
    const item = await mysqlService.addWarehouseInventory({
      warehouse_id: warehouseId,
      sku,
      name,
      category,
      quantity,
      unit_price,
      status
    });
    await mongoService.logActivity(
      `Added item ${item.name} (${item.sku}, Qty: ${item.quantity}) to Warehouse #${warehouseId}`,
      'INFO',
      { item }
    );
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inventory item
router.delete('/inventory/:itemId', async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const success = await mysqlService.deleteWarehouseInventory(itemId);
    await mongoService.logActivity(`Deleted item #${itemId} from warehouse inventory`, 'WARN', { itemId });
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new warehouse
router.post('/', async (req, res) => {
  try {
    const { name, city, lat, lng } = req.body;
    if (!name || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, city, lat, and lng are required' });
    }
    const warehouse = await mysqlService.addWarehouse(req.body);
    await mongoService.logActivity(`Warehouse added: ${warehouse.name} (${warehouse.city})`, 'INFO', { warehouse });
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
