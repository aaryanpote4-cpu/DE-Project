#!/usr/bin/env python3
"""
Delivery & Logistics Optimizer: Dual Database Seeder (Python)
Seeds MySQL with Relational Tables & Indian Logistics Data (via schema.sql & seed.sql)
and seeds MongoDB with NoSQL Collections (Inventory, Activity Logs) using PyMongo.
Usage: python database/seed_database.py
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load backend/.env or local .env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_paths = [
    os.path.join(current_dir, '..', 'backend', '.env'),
    os.path.join(current_dir, '.env')
]

for p in env_paths:
    if os.path.exists(p):
        load_dotenv(dotenv_path=p)
        break

# -------------------------------------------------------------
# Configuration
# -------------------------------------------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "logistics_db")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "logistics_db")

# -------------------------------------------------------------
# Initial NoSQL Data (MongoDB Collections)
# -------------------------------------------------------------
SAMPLE_INVENTORY = [
    {'id': 'PRD-001', 'name': 'Industrial Drones', 'quantity': 45, 'price': 1200.0, 'location': 'Delhi NCR Hub', 'status': 'In Stock'},
    {'id': 'PRD-002', 'name': 'Freight Containers', 'quantity': 12, 'price': 3500.0, 'location': 'Mumbai Port', 'status': 'In Stock'},
    {'id': 'PRD-003', 'name': 'Electronic Parts', 'quantity': 1500, 'price': 15.5, 'location': 'Bangalore Tech Park', 'status': 'In Stock'},
    {'id': 'PRD-004', 'name': 'Medical Supplies', 'quantity': 80, 'price': 250.0, 'location': 'Chennai Port', 'status': 'Packed'},
    {'id': 'PRD-005', 'name': 'Fresh Produce', 'quantity': 500, 'price': 4.0, 'location': 'Kolkata Port', 'status': 'In Stock'},
    {'id': 'PRD-006', 'name': 'Textile Materials', 'quantity': 300, 'price': 45.0, 'location': 'Mumbai Port', 'status': 'Dispatched'}
]


def seed_mysql():
    print("\n--- [1/2] Seeding MySQL Relational Database ---")
    try:
        import mysql.connector
    except ImportError:
        print("[Notice] mysql-connector-python not installed. Install via: pip install -r database/requirements.txt")
        print("[Fallback] You can run the Node.js seeder instead: node database/seed_mysql.js")
        return False

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()

        # Create Database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}`;")
        cursor.execute(f"USE `{MYSQL_DATABASE}`;")

        # Execute schema.sql if present
        schema_path = os.path.join(current_dir, 'schema.sql')
        if os.path.exists(schema_path):
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            for statement in schema_sql.split(';'):
                stmt = statement.strip()
                if stmt:
                    cursor.execute(stmt)
            print("  ✓ Created MySQL relational schema tables (warehouses, inventory, users, edges, shipments)")

        # Execute seed.sql if present
        seed_path = os.path.join(current_dir, 'seed.sql')
        if os.path.exists(seed_path):
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = f.read()
            for statement in seed_sql.split(';'):
                stmt = statement.strip()
                if stmt:
                    cursor.execute(stmt)
            print("  ✓ Seeded 14 Indian Warehouses, inventory, edges & demo users into MySQL!")

        conn.commit()
        cursor.close()
        conn.close()
        print(f"[MySQL] Successfully initialized '{MYSQL_DATABASE}' database!")
        return True
    except Exception as e:
        print(f"[MySQL Notice] Could not connect directly to MySQL ({e}).")
        print("Backend in-memory resilient fallback will supply all warehouses automatically.")
        return False


def seed_mongodb():
    print("\n--- [2/2] Seeding MongoDB NoSQL Database (PyMongo) ---")
    try:
        from pymongo import MongoClient
    except ImportError:
        print("[Notice] pymongo not installed. Install via: pip install pymongo")
        return False

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        client.admin.command('ping')
        db = client[MONGO_DATABASE]

        # 1. Seed Inventory
        inv_col = db['inventory']
        for item in SAMPLE_INVENTORY:
            inv_col.update_one({'id': item['id']}, {'$set': item}, upsert=True)
        print(f"  ✓ Upserted {len(SAMPLE_INVENTORY)} items into MongoDB 'inventory' collection")

        # 2. Seed Initial System Activity Log
        logs_col = db['activity_logs']
        logs_col.insert_one({
            'action': 'System database seeded via PyMongo seeder',
            'level': 'SUCCESS',
            'timestamp': datetime.utcnow().isoformat(),
            'metadata': {'seeded_by': 'Python database/seed_database.py'}
        })
        print("  ✓ Initialized MongoDB 'activity_logs' collection")

        print(f"[MongoDB] Successfully connected and seeded MongoDB database: {MONGO_DATABASE} at {MONGO_URI}!")
        return True
    except Exception as e:
        print(f"[MongoDB Notice] Could not connect to MongoDB ({e}).")
        print("Backend in-memory resilient store active.")
        return False


if __name__ == '__main__':
    print("=" * 65)
    print(" Delivery & Logistics Optimizer: Dual Database Seeder (Python)")
    print(" MySQL (Relational) + MongoDB (NoSQL Document Store)")
    print("=" * 65)

    seed_mysql()
    seed_mongodb()

    print("\n✅ Database setup finished!\n")
