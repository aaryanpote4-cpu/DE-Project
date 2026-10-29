const express = require('express');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');

const router = express.Router();

// Get all inventory across warehouses
router.get('/', async (req, res) => {
  try {
    const items = await mysqlService.getAllInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new inventory item to database
router.post('/', async (req, res) => {
  try {
    const { warehouse_id, name, sku, category, quantity, unit_price, price, status } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const wid = parseInt(warehouse_id, 10) || 1;
    const finalPrice = unit_price !== undefined ? parseFloat(unit_price) : parseFloat(price) || 0.0;

    // Save to relational MySQL inventory table
    const item = await mysqlService.addWarehouseInventory({
      warehouse_id: wid,
      sku,
      name,
      category: category || 'General',
      quantity: parseInt(quantity, 10) || 1,
      unit_price: finalPrice,
      status: status || 'In Stock'
    });

    // Mirror to MongoDB / logs
    await mongoService.logActivity(
      `Inventory added to Warehouse #${wid}: ${item.name} (SKU: ${item.sku}, Qty: ${item.quantity})`,
      'INFO',
      { item }
    );

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const success = await mysqlService.deleteWarehouseInventory(itemId);
    await mongoService.logActivity(`Inventory item #${itemId} deleted from database`, 'WARN', { itemId });
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restock inventory item
router.post('/buy', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) return res.status(400).json({ error: 'itemId and quantity required' });
    const item = await mongoService.buyInventoryItem(itemId, quantity);
    await mongoService.logActivity(`Restocked ${quantity} units of ${itemId}`, 'INFO', { itemId, quantity });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dispatch / sell inventory item
router.post('/sell', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) return res.status(400).json({ error: 'itemId and quantity required' });
    const item = await mongoService.sellInventoryItem(itemId, quantity);
    await mongoService.logActivity(`Dispatched ${quantity} units of ${itemId}`, 'INFO', { itemId, quantity });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
