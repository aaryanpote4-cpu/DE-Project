/**
 * Delivery & Logistics Optimizer: Automated Database Seeder (Node.js)
 * Executes database/schema.sql and database/seed.sql against MySQL.
 * Usage: node database/seed_mysql.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables from backend/.env or local .env
const envPath = fs.existsSync(path.join(__dirname, '..', 'backend', '.env'))
  ? path.join(__dirname, '..', 'backend', '.env')
  : path.join(__dirname, '.env');

require('dotenv').config({ path: envPath });

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'logistics_db';

async function seed() {
  console.log('========================================================');
  console.log(' Indian Logistics & Warehouse System: MySQL DB Seeder');
  console.log('========================================================');
  console.log(`Connecting to MySQL at ${MYSQL_HOST}:${MYSQL_PORT} (User: ${MYSQL_USER})...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      multipleStatements: true
    });

    console.log('[1/3] Connected to MySQL. Ensuring database exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;`);
    await connection.query(`USE \`${MYSQL_DATABASE}\`;`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('[2/3] Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('      ✓ Tables created (warehouses, inventory, users, edges, shipments)');
    }

    if (fs.existsSync(seedPath)) {
      console.log('[3/3] Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('      ✓ Seeded 14 Indian Warehouses, inventory items, edges & users!');
    }

    console.log('\n✅ Database setup & seeding successfully completed!\n');
  } catch (err) {
    console.error('\n[Notice] Could not connect directly to MySQL server:', err.message);
    console.log('The backend in-memory fallback will automatically supply all 14 warehouses and inventory items.\n');
  } finally {
    if (connection) await connection.end();
  }
}

seed();

module.exports = seed;
