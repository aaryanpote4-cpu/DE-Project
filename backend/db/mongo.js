const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;
let isConnected = false;

// Fallback in-memory store in case MongoDB instance is not yet running
const inMemoryMongo = {
  activity_logs: [
    {
      id: 'log-1',
      action: 'System initialized with MySQL & MongoDB architecture',
      level: 'INFO',
      timestamp: new Date().toISOString(),
      metadata: { engine: 'C++ Dijkstra Graph Engine', database: 'MySQL + MongoDB' }
    }
  ],
  order_tracking: {},
  inventory: [
    { id: 'PRD-001', name: 'Industrial Drones', quantity: 45, price: 1200.0, location: 'Delhi NCR Hub', status: 'In Stock' },
    { id: 'PRD-002', name: 'Freight Containers', quantity: 12, price: 3500.0, location: 'Mumbai Port', status: 'In Stock' },
    { id: 'PRD-003', name: 'Electronic Parts', quantity: 1500, price: 15.5, location: 'Bangalore Tech Park', status: 'In Stock' },
    { id: 'PRD-004', name: 'Medical Supplies', quantity: 80, price: 250.0, location: 'Chennai Port', status: 'Packed' },
    { id: 'PRD-005', name: 'Fresh Produce', quantity: 500, price: 4.0, location: 'Kolkata Port', status: 'In Stock' },
    { id: 'PRD-006', name: 'Textile Materials', quantity: 300, price: 45.0, location: 'Mumbai Port', status: 'Dispatched' }
  ],
  nextLogId: 2,
  nextInvId: 7
};

async function initMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DATABASE || 'logistics_db';

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    await client.connect();
    db = client.db(dbName);

    // Ensure collections exist & seed initial inventory if empty
    const inventoryCol = db.collection('inventory');
    const invCount = await inventoryCol.countDocuments();
    if (invCount === 0) {
      console.log('Seeding initial MongoDB inventory collection...');
      await inventoryCol.insertMany(inMemoryMongo.inventory);
    }

    const activityCol = db.collection('activity_logs');
    const logCount = await activityCol.countDocuments();
    if (logCount === 0) {
      await activityCol.insertMany(inMemoryMongo.activity_logs);
    }

    isConnected = true;
    console.log(`[MongoDB] Successfully connected to MongoDB database: ${dbName} at ${uri}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB Tip] You can start a local MongoDB instance or provide a MongoDB Atlas connection string in backend/.env under MONGO_URI. Fallback active.`);
    return false;
  }
}

const mongoService = {
  isAvailable: () => isConnected,

  async logActivity(action, level = 'INFO', metadata = {}) {
    const entry = {
      action,
      level,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (isConnected && db) {
      try {
        const res = await db.collection('activity_logs').insertOne(entry);
        return { id: res.insertedId, ...entry };
      } catch (e) {
        console.error('Mongo log error:', e.message);
      }
    }

    const fallbackEntry = { id: `log-${inMemoryMongo.nextLogId++}`, ...entry };
    inMemoryMongo.activity_logs.unshift(fallbackEntry);
    return fallbackEntry;
  },

  async getActivityLogs(limit = 50) {
    if (isConnected && db) {
      try {
        return await db.collection('activity_logs')
          .find({})
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
      } catch (e) {
        console.error('Mongo getLogs error:', e.message);
      }
    }
    return inMemoryMongo.activity_logs.slice(0, limit);
  },

  async upsertOrderTracking(orderId, trackingData) {
    const doc = {
      orderId: String(orderId),
      ...trackingData,
      updatedAt: new Date().toISOString()
    };

    if (isConnected && db) {
      try {
        await db.collection('order_tracking').updateOne(
          { orderId: String(orderId) },
          { $set: doc },
          { upsert: true }
        );
        return doc;
      } catch (e) {
        console.error('Mongo upsertOrderTracking error:', e.message);
      }
    }

    inMemoryMongo.order_tracking[String(orderId)] = doc;
    return doc;
  },

  async getOrderTracking(orderId) {
    if (isConnected && db) {
      try {
        return await db.collection('order_tracking').findOne({ orderId: String(orderId) });
      } catch (e) {
        console.error('Mongo getOrderTracking error:', e.message);
      }
    }
    return inMemoryMongo.order_tracking[String(orderId)] || null;
  },

  async getInventory() {
    if (isConnected && db) {
      try {
        return await db.collection('inventory').find({}).toArray();
      } catch (e) {
        console.error('Mongo getInventory error:', e.message);
      }
    }
    return inMemoryMongo.inventory;
  },

  async addInventoryItem(item) {
    const doc = {
      id: item.id || `PRD-00${inMemoryMongo.nextInvId++}`,
      name: item.name,
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      location: item.location || 'Central Warehouse',
      status: item.status || 'In Stock',
      createdAt: new Date().toISOString()
    };

    if (isConnected && db) {
      try {
        await db.collection('inventory').insertOne(doc);
        return doc;
      } catch (e) {
        console.error('Mongo addInventoryItem error:', e.message);
      }
    }

    inMemoryMongo.inventory.push(doc);
    return doc;
  },

  async buyInventoryItem(itemId, quantity) {
    const qty = Number(quantity);
    if (isConnected && db) {
      try {
        await db.collection('inventory').updateOne(
          { id: itemId },
          { $inc: { quantity: qty } }
        );
        return await db.collection('inventory').findOne({ id: itemId });
      } catch (e) {
        console.error('Mongo buyInventoryItem error:', e.message);
      }
    }

    const item = inMemoryMongo.inventory.find(i => i.id === itemId);
    if (item) item.quantity += qty;
    return item;
  },

  async sellInventoryItem(itemId, quantity) {
    const qty = Number(quantity);
    if (isConnected && db) {
      try {
        const item = await db.collection('inventory').findOne({ id: itemId });
        if (!item || item.quantity < qty) {
          throw new Error('Insufficient inventory stock');
        }
        await db.collection('inventory').updateOne(
          { id: itemId },
          { $inc: { quantity: -qty } }
        );
        return await db.collection('inventory').findOne({ id: itemId });
      } catch (e) {
        throw e;
      }
    }

    const item = inMemoryMongo.inventory.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    if (item.quantity < qty) throw new Error('Insufficient inventory stock');
    item.quantity -= qty;
    return item;
  }
};

module.exports = {
  initMongo,
  mongoService,
  getDb: () => db
};
