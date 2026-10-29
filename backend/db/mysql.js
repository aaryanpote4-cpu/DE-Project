const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool = null;
let isConnected = false;

// ------------------------------------------------------------------------------
// Realistic Indian Logistics Data (14 Hubs & Warehouses)
// ------------------------------------------------------------------------------
const SEED_WAREHOUSES = [
  { id: 1, code: 'WH-DEL', name: 'Delhi NCR Mega Fulfillment Center', city: 'Delhi', state: 'Delhi NCR', lat: 28.7041, lng: 77.1025, total_capacity_sqft: 120000, used_capacity_sqft: 105000, status: 'near_full', manager_contact: '+91 98110 12345' },
  { id: 2, code: 'WH-BOM', 'name': 'Mumbai Port Gateway Warehouse', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, total_capacity_sqft: 150000, used_capacity_sqft: 142000, status: 'full', manager_contact: '+91 98200 23456' },
  { id: 3, code: 'WH-BLR', 'name': 'Bengaluru Tech Logistics Hub', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, total_capacity_sqft: 100000, used_capacity_sqft: 48000, status: 'available', manager_contact: '+91 98450 34567' },
  { id: 4, code: 'WH-MAA', 'name': 'Chennai Port Coastal Depot', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, total_capacity_sqft: 95000, used_capacity_sqft: 62000, status: 'available', manager_contact: '+91 98400 45678' },
  { id: 5, code: 'WH-CCU', 'name': 'Kolkata Eastern Logistics Terminal', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, total_capacity_sqft: 85000, used_capacity_sqft: 79000, status: 'near_full', manager_contact: '+91 98300 56789' },
  { id: 6, code: 'WH-HYD', 'name': 'Hyderabad Central Distribution Hub', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, total_capacity_sqft: 110000, used_capacity_sqft: 52000, status: 'available', manager_contact: '+91 98660 67890' },
  { id: 7, code: 'WH-AMD', 'name': 'Ahmedabad Industrial Freight Center', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, total_capacity_sqft: 90000, used_capacity_sqft: 83000, status: 'near_full', manager_contact: '+91 98250 78901' },
  { id: 8, code: 'WH-PNQ', 'name': 'Pune Auto-Cluster Logistics Base', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, total_capacity_sqft: 80000, used_capacity_sqft: 39000, status: 'available', manager_contact: '+91 98220 89012' },
  { id: 9, code: 'WH-JAI', 'name': 'Jaipur North-West Freight Station', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, total_capacity_sqft: 65000, used_capacity_sqft: 24000, status: 'available', manager_contact: '+91 98290 90123' },
  { id: 10, code: 'WH-KLH', 'name': 'Kolhapur Agri & Engineering Depot', city: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433, total_capacity_sqft: 50000, used_capacity_sqft: 21000, status: 'available', manager_contact: '+91 98230 11223' },
  { id: 11, code: 'WH-COK', 'name': 'Cochin Transshipment Maritime Hub', city: 'Kochi', state: 'Kerala', lat: 9.9667, lng: 76.2667, total_capacity_sqft: 75000, used_capacity_sqft: 71000, status: 'near_full', manager_contact: '+91 98470 22334' },
  { id: 12, code: 'WH-IDR', 'name': 'Indore Central Agro-Logistics Center', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, total_capacity_sqft: 70000, used_capacity_sqft: 68500, status: 'near_full', manager_contact: '+91 98260 33445' },
  { id: 13, code: 'WH-LKO', 'name': 'Lucknow Oudh Freight Terminal', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, total_capacity_sqft: 60000, used_capacity_sqft: 29000, status: 'available', manager_contact: '+91 98390 44556' },
  { id: 14, code: 'WH-IXC', 'name': 'Chandigarh Northern Depot', city: 'Chandigarh', state: 'Punjab & Haryana', lat: 30.7333, lng: 76.7794, total_capacity_sqft: 55000, used_capacity_sqft: 51000, status: 'near_full', manager_contact: '+91 98140 55667' }
];

const SEED_INVENTORY = [
  // Delhi
  { id: 1, warehouse_id: 1, sku: 'DEL-EL-01', name: 'Heavy Duty Solar Inverters (5kVA)', category: 'Electronics', quantity: 180, unit_price: 45000.0, status: 'In Stock' },
  { id: 2, warehouse_id: 1, sku: 'DEL-MD-02', name: 'Automated External Defibrillators', category: 'Medical', quantity: 95, unit_price: 32000.0, status: 'In Stock' },
  { id: 3, warehouse_id: 1, sku: 'DEL-TX-03', name: 'Organic Cotton Fabric Bolts', category: 'Textiles', quantity: 1450, unit_price: 650.0, status: 'In Stock' },
  { id: 4, warehouse_id: 1, sku: 'DEL-AG-04', name: 'Basmati Rice Export Grade (50kg)', category: 'Agriculture', quantity: 3200, unit_price: 3800.0, status: 'In Stock' },
  { id: 5, warehouse_id: 1, sku: 'DEL-AU-05', name: 'EV Lithium Battery Packs (48V)', category: 'Automotive', quantity: 80, unit_price: 72000.0, status: 'Low Stock' },
  { id: 6, warehouse_id: 1, sku: 'DEL-IN-06', name: 'Warehouse Transport Drones (X-200)', category: 'Robotics', quantity: 35, unit_price: 125000.0, status: 'In Stock' },

  // Mumbai
  { id: 7, warehouse_id: 2, sku: 'BOM-CN-01', name: 'Standard 40ft Intermodal Containers', category: 'Industrial', quantity: 24, unit_price: 280000.0, status: 'In Stock' },
  { id: 8, warehouse_id: 2, sku: 'BOM-TX-02', name: 'Silk Garment Export Consignments', category: 'Textiles', quantity: 2100, unit_price: 1850.0, status: 'In Stock' },
  { id: 9, warehouse_id: 2, sku: 'BOM-CH-03', name: 'Industrial Specialty Catalysts', category: 'Chemicals', quantity: 450, unit_price: 18500.0, status: 'In Stock' },
  { id: 10, warehouse_id: 2, sku: 'BOM-EL-04', name: '5G Telecom Transceiver Modules', category: 'Electronics', quantity: 600, unit_price: 14200.0, status: 'In Stock' },
  { id: 11, warehouse_id: 2, sku: 'BOM-FM-05', name: 'Frozen Seafood Cargo Units (-18C)', category: 'Cold Chain', quantity: 380, unit_price: 28000.0, status: 'In Stock' },

  // Bengaluru
  { id: 12, warehouse_id: 3, sku: 'BLR-SC-01', name: 'Semiconductor Microcontrollers (32-bit)', category: 'Electronics', quantity: 12500, unit_price: 480.0, status: 'In Stock' },
  { id: 13, warehouse_id: 3, sku: 'BLR-AI-02', name: 'Edge AI Vision Sensor Units', category: 'Electronics', quantity: 840, unit_price: 9500.0, status: 'In Stock' },
  { id: 14, warehouse_id: 3, sku: 'BLR-SV-03', name: 'Server Rack Enclosures (42U)', category: 'Hardware', quantity: 110, unit_price: 54000.0, status: 'In Stock' },
  { id: 15, warehouse_id: 3, sku: 'BLR-MD-04', name: 'Surgical Laparoscopy Instruments', category: 'Medical', quantity: 310, unit_price: 22000.0, status: 'In Stock' },
  { id: 16, warehouse_id: 3, sku: 'BLR-EV-05', name: 'DC Fast Charger Stations (60kW)', category: 'Automotive', quantity: 45, unit_price: 195000.0, status: 'In Stock' },

  // Chennai
  { id: 17, warehouse_id: 4, sku: 'MAA-AU-01', name: 'Automobile Transmission Gearboxes', category: 'Automotive', quantity: 420, unit_price: 38000.0, status: 'In Stock' },
  { id: 18, warehouse_id: 4, sku: 'MAA-PV-02', name: 'Solar Photovoltaic Modules (540W)', category: 'Energy', quantity: 1800, unit_price: 11500.0, status: 'In Stock' },
  { id: 19, warehouse_id: 4, sku: 'MAA-EL-03', name: 'Printed Circuit Board Assemblies', category: 'Electronics', quantity: 5400, unit_price: 750.0, status: 'In Stock' },
  { id: 20, warehouse_id: 4, sku: 'MAA-TX-04', name: 'Finished Leather Raw Hides', category: 'Materials', quantity: 890, unit_price: 4200.0, status: 'In Stock' },

  // Kolkata
  { id: 21, warehouse_id: 5, sku: 'CCU-ST-01', name: 'Cold-Rolled Steel Coils (High Grade)', category: 'Metals', quantity: 340, unit_price: 68000.0, status: 'In Stock' },
  { id: 22, warehouse_id: 5, sku: 'CCU-AG-02', name: 'Darjeeling CTC Tea Bales (Bulk)', category: 'Agriculture', quantity: 2400, unit_price: 1200.0, status: 'In Stock' },
  { id: 23, warehouse_id: 5, sku: 'CCU-JT-03', name: 'Eco-friendly Jute Packaging Rolls', category: 'Textiles', quantity: 6500, unit_price: 320.0, status: 'In Stock' },

  // Hyderabad
  { id: 24, warehouse_id: 6, sku: 'HYD-PH-01', name: 'Active Pharmaceutical Ingredients (API)', category: 'Pharma', quantity: 1600, unit_price: 12500.0, status: 'In Stock' },
  { id: 25, warehouse_id: 6, sku: 'HYD-VC-02', name: 'Temperature-Controlled Vaccine Vials', category: 'Cold Chain', quantity: 8500, unit_price: 850.0, status: 'In Stock' },
  { id: 26, warehouse_id: 6, sku: 'HYD-EL-03', name: 'Smart Energy Metering Hubs', category: 'Electronics', quantity: 1900, unit_price: 3100.0, status: 'In Stock' },

  // Ahmedabad
  { id: 27, warehouse_id: 7, sku: 'AMD-TX-01', name: 'Denim Fabric Weave Rolls (300m)', category: 'Textiles', quantity: 3200, unit_price: 16000.0, status: 'In Stock' },
  { id: 28, warehouse_id: 7, sku: 'AMD-CH-02', name: 'Industrial Polymer Pellets (25kg)', category: 'Chemicals', quantity: 4800, unit_price: 2100.0, status: 'In Stock' },
  { id: 29, warehouse_id: 7, sku: 'AMD-DS-03', name: 'Diamond Polishing Equipment Units', category: 'Machinery', quantity: 65, unit_price: 85000.0, status: 'In Stock' },

  // Pune
  { id: 30, warehouse_id: 8, sku: 'PNQ-AU-01', name: 'Commercial Vehicle Brake Rotors', category: 'Automotive', quantity: 1400, unit_price: 5200.0, status: 'In Stock' },
  { id: 31, warehouse_id: 8, sku: 'PNQ-EN-02', name: 'Industrial Hydraulics Powerpacks', category: 'Engineering', quantity: 120, unit_price: 62000.0, status: 'In Stock' },

  // Jaipur
  { id: 32, warehouse_id: 9, sku: 'JAI-CR-01', name: 'Blue Pottery & Marble Handicrafts', category: 'Art & Decor', quantity: 1200, unit_price: 1800.0, status: 'In Stock' },
  { id: 33, warehouse_id: 9, sku: 'JAI-SL-02', name: 'Solar Water Pump Arrays (5HP)', category: 'Agriculture', quantity: 140, unit_price: 82000.0, status: 'In Stock' },

  // Kolhapur
  { id: 34, warehouse_id: 10, sku: 'KLH-AG-01', name: 'Organic Jaggery Bulk Blocks (50kg)', category: 'Agriculture', quantity: 4500, unit_price: 2400.0, status: 'In Stock' },
  { id: 35, warehouse_id: 10, sku: 'KLH-CS-02', name: 'Grey Iron Engine Block Castings', category: 'Foundry', quantity: 620, unit_price: 14500.0, status: 'In Stock' },
  { id: 36, warehouse_id: 10, sku: 'KLH-LT-03', name: 'Handcrafted Kolhapuri Leather Goods', category: 'Leather', quantity: 1850, unit_price: 1200.0, status: 'In Stock' },

  // Kochi
  { id: 37, warehouse_id: 11, sku: 'COK-SP-01', name: 'Malabar Black Pepper Bags (Extra Bold)', category: 'Spices', quantity: 1900, unit_price: 18000.0, status: 'In Stock' },
  { id: 38, warehouse_id: 11, sku: 'COK-RB-02', name: 'Natural Rubber Ribbed Smoked Sheets', category: 'Commodity', quantity: 2400, unit_price: 8500.0, status: 'In Stock' },

  // Indore
  { id: 39, warehouse_id: 12, sku: 'IDR-SY-01', name: 'Soybean De-Oiled Cake (DOC)', category: 'Agro-commodities', quantity: 5200, unit_price: 3200.0, status: 'In Stock' },
  { id: 40, warehouse_id: 12, sku: 'IDR-PH-02', name: 'Sterile Injectable Infusion Bags', category: 'Pharma', quantity: 7200, unit_price: 120.0, status: 'In Stock' },

  // Lucknow
  { id: 41, warehouse_id: 13, sku: 'LKO-CK-01', name: 'Chikankari Handloom Embroidered Rolls', category: 'Textiles', quantity: 1100, unit_price: 4500.0, status: 'In Stock' },
  { id: 42, warehouse_id: 13, sku: 'LKO-MD-02', name: 'Diagnostic Blood Test Cartridges', category: 'Medical', quantity: 3100, unit_price: 420.0, status: 'In Stock' },

  // Chandigarh
  { id: 43, warehouse_id: 14, sku: 'IXC-TR-01', name: 'Tractor Power Take-Off Shafts', category: 'Agricultural Mach.', quantity: 380, unit_price: 16500.0, status: 'In Stock' },
  { id: 44, warehouse_id: 14, sku: 'IXC-PH-02', name: 'Broad-Spectrum Antibiotic Formulations', category: 'Pharma', quantity: 4200, unit_price: 350.0, status: 'In Stock' }
];

const SEED_EDGES = [
  { id: 1, source: 1, destination: 2, distance: 1400 },
  { id: 2, source: 2, destination: 3, distance: 980 },
  { id: 3, source: 3, destination: 4, distance: 350 },
  { id: 4, source: 1, destination: 5, distance: 1500 },
  { id: 5, source: 5, destination: 4, distance: 1670 },
  { id: 6, source: 2, destination: 7, distance: 530 },
  { id: 7, source: 7, destination: 1, distance: 940 },
  { id: 8, source: 3, destination: 6, distance: 570 },
  { id: 9, source: 6, destination: 4, distance: 630 },
  { id: 10, source: 3, destination: 11, distance: 530 },
  { id: 11, source: 2, destination: 8, distance: 150 },
  { id: 12, source: 8, destination: 10, distance: 235 },
  { id: 13, source: 10, destination: 3, distance: 615 },
  { id: 14, source: 1, destination: 9, distance: 280 },
  { id: 15, source: 9, destination: 7, distance: 670 },
  { id: 16, source: 7, destination: 12, distance: 390 },
  { id: 17, source: 12, destination: 1, distance: 840 },
  { id: 18, source: 1, destination: 13, distance: 550 },
  { id: 19, source: 13, destination: 5, distance: 980 },
  { id: 20, source: 1, destination: 14, distance: 250 }
];

const SEED_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@logistics.in',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    full_name: 'Logistics Director'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@logistics.in',
    password_hash: bcrypt.hashSync('manager123', 10),
    role: 'manager',
    full_name: 'Mumbai Hub Supervisor'
  },
  {
    id: 3,
    username: 'customer',
    email: 'customer@client.in',
    password_hash: bcrypt.hashSync('customer123', 10),
    role: 'customer',
    full_name: 'Bharat Exports Ltd'
  }
];

const SEED_SHIPMENTS = [
  { id: 1, tracking_number: 'TRK-IND-1001', source: 1, destination: 2, status: 'In-Transit', urgency: 'High', deadline: '2026-10-30T18:00:00.000Z', distance: 1400 },
  { id: 2, tracking_number: 'TRK-IND-1002', source: 2, destination: 3, status: 'Pending', urgency: 'Critical', deadline: '2026-10-29T14:00:00.000Z', distance: 980 },
  { id: 3, tracking_number: 'TRK-IND-1003', source: 3, destination: 4, status: 'Delivered', urgency: 'Medium', deadline: '2026-10-28T10:00:00.000Z', distance: 350 },
  { id: 4, tracking_number: 'TRK-IND-1004', source: 8, destination: 10, status: 'In-Transit', urgency: 'High', deadline: '2026-10-31T09:00:00.000Z', distance: 235 },
  { id: 5, tracking_number: 'TRK-IND-1005', source: 7, destination: 1, status: 'Pending', urgency: 'Low', deadline: '2026-11-02T20:00:00.000Z', distance: 940 },
  { id: 6, tracking_number: 'TRK-IND-1006', source: 10, destination: 3, status: 'Pending', urgency: 'Medium', deadline: '2026-11-01T16:00:00.000Z', distance: 615 }
];

// Fallback in-memory store in case MySQL credentials are not yet configured or service is offline
const inMemoryStore = {
  warehouses: [...SEED_WAREHOUSES],
  locations: SEED_WAREHOUSES.map(w => ({ id: w.id, code: w.code, name: w.name, lat: w.lat, lng: w.lng })),
  inventory: [...SEED_INVENTORY],
  edges: [...SEED_EDGES],
  orders: [...SEED_SHIPMENTS],
  users: [...SEED_USERS],
  nextWarehouseId: 15,
  nextInventoryId: 45,
  nextEdgeId: 21,
  nextOrderId: 7,
  nextUserId: 4
};

async function initMySQL() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'logistics_db';

  try {
    const rootConnection = await mysql.createConnection({ host, port, user, password });
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await rootConnection.end();

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create Relational Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        total_capacity_sqft INT NOT NULL DEFAULT 50000,
        used_capacity_sqft INT NOT NULL DEFAULT 0,
        status ENUM('available', 'near_full', 'full', 'maintenance') DEFAULT 'available',
        manager_contact VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Backwards-compatible locations alias/table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NULL,
        name VARCHAR(255) NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        warehouse_id INT NOT NULL,
        sku VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('In Stock', 'Low Stock', 'Out of Stock', 'Dispatched') DEFAULT 'In Stock',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_warehouse_id (warehouse_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'customer') DEFAULT 'customer',
        full_name VARCHAR(150) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS edges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source INT NOT NULL,
        destination INT NOT NULL,
        distance DOUBLE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source INT NOT NULL,
        destination INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        urgency VARCHAR(20) DEFAULT 'Medium',
        deadline VARCHAR(100) NULL,
        distance DOUBLE DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed warehouses if empty
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM warehouses');
    if (existing[0].count === 0) {
      console.log('Seeding initial 14 Indian Warehouses into MySQL...');
      for (const w of SEED_WAREHOUSES) {
        await pool.query(
          'INSERT IGNORE INTO warehouses (id, code, name, city, state, lat, lng, total_capacity_sqft, used_capacity_sqft, status, manager_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [w.id, w.code, w.name, w.city, w.state, w.lat, w.lng, w.total_capacity_sqft, w.used_capacity_sqft, w.status, w.manager_contact]
        );
        await pool.query(
          'INSERT IGNORE INTO locations (id, code, name, lat, lng) VALUES (?, ?, ?, ?, ?)',
          [w.id, w.code, w.name, w.lat, w.lng]
        );
      }
      for (const item of SEED_INVENTORY) {
        await pool.query(
          'INSERT IGNORE INTO inventory (id, warehouse_id, sku, name, category, quantity, unit_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.warehouse_id, item.sku, item.name, item.category, item.quantity, item.unit_price, item.status]
        );
      }
      for (const edge of SEED_EDGES) {
        await pool.query(
          'INSERT IGNORE INTO edges (id, source, destination, distance) VALUES (?, ?, ?, ?)',
          [edge.id, edge.source, edge.destination, edge.distance]
        );
      }
      for (const order of SEED_SHIPMENTS) {
        await pool.query(
          'INSERT IGNORE INTO orders (id, source, destination, status, urgency, deadline, distance) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [order.id, order.source, order.destination, order.status, order.urgency, order.deadline, order.distance]
        );
      }
      for (const user of SEED_USERS) {
        await pool.query(
          'INSERT IGNORE INTO users (id, username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, user.username, user.email, user.password_hash, user.role, user.full_name]
        );
      }
    }

    isConnected = true;
    console.log(`[MySQL] Successfully connected to MySQL database: ${database} at ${host}:${port}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MySQL Warning] Could not connect to MySQL (${error.message}).`);
    console.warn(`[MySQL Tip] In-memory resilient store active with all 14 Indian Warehouses & Inventory.`);
    return false;
  }
}

async function executeQuery(sql, params = []) {
  if (isConnected && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
  return null;
}

const mysqlService = {
  isAvailable: () => isConnected,

  // ----------------------------------------------------------------------------
  // Warehouses
  // ----------------------------------------------------------------------------
  async getWarehouses() {
    if (isConnected) {
      return await executeQuery('SELECT * FROM warehouses ORDER BY id ASC');
    }
    return inMemoryStore.warehouses;
  },

  async getWarehouseById(id) {
    const wid = parseInt(id, 10);
    if (isConnected) {
      const rows = await executeQuery('SELECT * FROM warehouses WHERE id = ?', [wid]);
      return rows[0] || null;
    }
    return inMemoryStore.warehouses.find(w => w.id === wid) || null;
  },

  async addWarehouse(data) {
    const { code, name, city, state, lat, lng, total_capacity_sqft, used_capacity_sqft, status, manager_contact } = data;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const totalCap = parseInt(total_capacity_sqft, 10) || 50000;
    const usedCap = parseInt(used_capacity_sqft, 10) || 0;

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO warehouses (code, name, city, state, lat, lng, total_capacity_sqft, used_capacity_sqft, status, manager_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [code, name, city, state, latitude, longitude, totalCap, usedCap, status || 'available', manager_contact || null]
      );
      const [rows] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [res.insertId]);
      // Also sync locations
      await pool.query('INSERT IGNORE INTO locations (id, code, name, lat, lng) VALUES (?, ?, ?, ?, ?)', [res.insertId, code, name, latitude, longitude]);
      return rows[0];
    }

    const newWarehouse = {
      id: inMemoryStore.nextWarehouseId++,
      code: code || `WH-IND-${inMemoryStore.nextWarehouseId}`,
      name,
      city: city || 'City Hub',
      state: state || 'State',
      lat: latitude,
      lng: longitude,
      total_capacity_sqft: totalCap,
      used_capacity_sqft: usedCap,
      status: status || 'available',
      manager_contact: manager_contact || '+91 99999 00000'
    };
    inMemoryStore.warehouses.push(newWarehouse);
    inMemoryStore.locations.push({ id: newWarehouse.id, code: newWarehouse.code, name: newWarehouse.name, lat: newWarehouse.lat, lng: newWarehouse.lng });
    return newWarehouse;
  },

  // ----------------------------------------------------------------------------
  // Warehouse Inventory
  // ----------------------------------------------------------------------------
  async getWarehouseInventory(warehouseId) {
    const wid = parseInt(warehouseId, 10);
    if (isConnected) {
      return await executeQuery('SELECT * FROM inventory WHERE warehouse_id = ? ORDER BY id ASC', [wid]);
    }
    return inMemoryStore.inventory.filter(i => i.warehouse_id === wid);
  },

  async getAllInventory() {
    if (isConnected) {
      return await executeQuery('SELECT i.*, w.name as warehouse_name, w.city as warehouse_city FROM inventory i LEFT JOIN warehouses w ON i.warehouse_id = w.id ORDER BY i.id ASC');
    }
    return inMemoryStore.inventory.map(item => {
      const wh = inMemoryStore.warehouses.find(w => w.id === item.warehouse_id);
      return {
        ...item,
        warehouse_name: wh ? wh.name : 'Unknown Hub',
        warehouse_city: wh ? wh.city : 'Unknown'
      };
    });
  },

  async addWarehouseInventory(data) {
    const { warehouse_id, sku, name, category, quantity, unit_price, status } = data;
    const wid = parseInt(warehouse_id, 10);
    const qty = parseInt(quantity, 10) || 1;
    const price = parseFloat(unit_price) || 0.0;
    const itemSku = sku || `SKU-${wid}-${Date.now().toString().slice(-5)}`;
    const itemStatus = status || 'In Stock';

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO inventory (warehouse_id, sku, name, category, quantity, unit_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [wid, itemSku, name, category || 'General', qty, price, itemStatus]
      );
      // Increment used capacity in warehouse
      await pool.query(
        'UPDATE warehouses SET used_capacity_sqft = LEAST(total_capacity_sqft, used_capacity_sqft + ?) WHERE id = ?',
        [qty * 10, wid]
      );
      // Recalculate status
      const [whRows] = await pool.query('SELECT total_capacity_sqft, used_capacity_sqft FROM warehouses WHERE id = ?', [wid]);
      if (whRows.length > 0) {
        const util = Math.round((whRows[0].used_capacity_sqft / whRows[0].total_capacity_sqft) * 100);
        let newStatus = util >= 90 ? 'full' : util >= 70 ? 'near_full' : 'available';
        await pool.query('UPDATE warehouses SET status = ? WHERE id = ?', [newStatus, wid]);
      }
      const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const newItem = {
      id: inMemoryStore.nextInventoryId++,
      warehouse_id: wid,
      sku: itemSku,
      name,
      category: category || 'General',
      quantity: qty,
      unit_price: price,
      status: itemStatus,
      last_updated: new Date().toISOString()
    };
    inMemoryStore.inventory.push(newItem);

    // Update warehouse capacity & status in memory
    const wh = inMemoryStore.warehouses.find(w => w.id === wid);
    if (wh) {
      wh.used_capacity_sqft = Math.min(wh.total_capacity_sqft, (wh.used_capacity_sqft || 0) + (qty * 10));
      wh.utilization = Math.min(100, Math.round((wh.used_capacity_sqft / wh.total_capacity_sqft) * 100));
      wh.status = wh.utilization >= 90 ? 'full' : wh.utilization >= 70 ? 'near_full' : 'available';
    }

    return newItem;
  },

  async deleteWarehouseInventory(itemId) {
    const id = parseInt(itemId, 10);
    if (isConnected) {
      const [existing] = await pool.query('SELECT warehouse_id, quantity FROM inventory WHERE id = ?', [id]);
      if (existing.length > 0) {
        const { warehouse_id, quantity } = existing[0];
        await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
        await pool.query(
          'UPDATE warehouses SET used_capacity_sqft = GREATEST(0, used_capacity_sqft - ?) WHERE id = ?',
          [quantity * 10, warehouse_id]
        );
      }
      return true;
    }

    const idx = inMemoryStore.inventory.findIndex(i => i.id === id);
    if (idx !== -1) {
      const item = inMemoryStore.inventory[idx];
      inMemoryStore.inventory.splice(idx, 1);
      const wh = inMemoryStore.warehouses.find(w => w.id === item.warehouse_id);
      if (wh) {
        wh.used_capacity_sqft = Math.max(0, (wh.used_capacity_sqft || 0) - (item.quantity * 10));
        wh.utilization = Math.min(100, Math.round((wh.used_capacity_sqft / wh.total_capacity_sqft) * 100));
        wh.status = wh.utilization >= 90 ? 'full' : wh.utilization >= 70 ? 'near_full' : 'available';
      }
      return true;
    }
    return false;
  },

  // ----------------------------------------------------------------------------
  // Users & Authentication
  // ----------------------------------------------------------------------------
  async findUserByEmail(email) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (isConnected) {
      const rows = await executeQuery('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1', [cleanEmail, cleanEmail]);
      return rows[0] || null;
    }
    return inMemoryStore.users.find(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanEmail) || null;
  },

  async createUser({ username, email, password, role = 'customer', full_name = '' }) {
    const hash = await bcrypt.hash(password, 10);
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)',
        [cleanUsername, cleanEmail, hash, role, full_name]
      );
      const [rows] = await pool.query('SELECT id, username, email, role, full_name, created_at FROM users WHERE id = ?', [res.insertId]);
      return rows[0];
    }

    const newUser = {
      id: inMemoryStore.nextUserId++,
      username: cleanUsername,
      email: cleanEmail,
      password_hash: hash,
      role,
      full_name,
      created_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  // ----------------------------------------------------------------------------
  // Database Live Snapshot for Presentation Demo (/admin /database-view)
  // ----------------------------------------------------------------------------
  async getDatabaseSnapshot() {
    const warehouses = await this.getWarehouses();
    const inventory = await this.getAllInventory();
    const orders = await this.getOrders();
    const edges = await this.getEdges();

    let users = [];
    if (isConnected) {
      users = await executeQuery('SELECT id, username, email, role, full_name, created_at FROM users ORDER BY id ASC');
    } else {
      users = inMemoryStore.users.map(({ password_hash, ...rest }) => rest);
    }

    return {
      connected: isConnected,
      engine: isConnected ? 'MySQL 8.0 Live Connection' : 'In-Memory Resilient Store (MySQL Emulation)',
      tables: {
        warehouses: { count: warehouses.length, rows: warehouses },
        inventory: { count: inventory.length, rows: inventory },
        orders: { count: orders.length, rows: orders },
        edges: { count: edges.length, rows: edges },
        users: { count: users.length, rows: users }
      }
    };
  },

  // ----------------------------------------------------------------------------
  // Backwards-compatible Locations, Edges, Orders
  // ----------------------------------------------------------------------------
  async getLocations() {
    if (isConnected) {
      return await executeQuery('SELECT * FROM locations ORDER BY id ASC');
    }
    return inMemoryStore.locations;
  },

  async addLocation(name, lat, lng, code = null) {
    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO locations (name, lat, lng, code) VALUES (?, ?, ?, ?)',
        [name, parseFloat(lat), parseFloat(lng), code]
      );
      const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [res.insertId]);
      return rows[0];
    }
    const newLoc = {
      id: inMemoryStore.nextWarehouseId++,
      code: code || `LOC-${inMemoryStore.nextWarehouseId}`,
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    inMemoryStore.locations.push(newLoc);
    return newLoc;
  },

  async getEdges() {
    if (isConnected) {
      return await executeQuery('SELECT * FROM edges ORDER BY id ASC');
    }
    return inMemoryStore.edges;
  },

  async addEdge(source, destination, distance) {
    const src = parseInt(source, 10);
    const dst = parseInt(destination, 10);
    const dist = parseFloat(distance);

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO edges (source, destination, distance) VALUES (?, ?, ?)',
        [src, dst, dist]
      );
      const [rows] = await pool.query('SELECT * FROM edges WHERE id = ?', [res.insertId]);
      return rows[0];
    }
    const newEdge = {
      id: inMemoryStore.nextEdgeId++,
      source: src,
      destination: dst,
      distance: dist
    };
    inMemoryStore.edges.push(newEdge);
    return newEdge;
  },

  async getOrders() {
    if (isConnected) {
      return await executeQuery('SELECT * FROM orders ORDER BY id ASC');
    }
    return inMemoryStore.orders;
  },

  async addOrder(source, destination, urgency = 'Medium', deadline = null, distance = 0) {
    const src = parseInt(source, 10);
    const dst = parseInt(destination, 10);

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO orders (source, destination, status, urgency, deadline, distance) VALUES (?, ?, ?, ?, ?, ?)',
        [src, dst, 'Pending', urgency, deadline, distance]
      );
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [res.insertId]);
      return rows[0];
    }
    const newOrder = {
      id: inMemoryStore.nextOrderId++,
      source: src,
      destination: dst,
      status: 'Pending',
      urgency,
      deadline: deadline || new Date(Date.now() + 24 * 3600000).toISOString(),
      distance
    };
    inMemoryStore.orders.push(newOrder);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    const orderId = parseInt(id, 10);
    if (isConnected) {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      return rows[0];
    }
    const order = inMemoryStore.orders.find(o => o.id === orderId);
    if (order) order.status = status;
    return order;
  }
};

module.exports = {
  initMySQL,
  mysqlService,
  getPool: () => pool
};
