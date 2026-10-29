#!/usr/bin/env python3
"""
Delivery & Logistics Optimizer: PyMongo Data Export & Aggregation Reporter
Demonstrates PyMongo aggregation pipelines, statistics generation, and JSON export.
Usage: python database/sync_export.py
"""

import os
import json
from datetime import datetime
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
env_paths = [
    os.path.join(current_dir, '..', 'backend', '.env'),
    os.path.join(current_dir, '.env')
]

for p in env_paths:
    if os.path.exists(p):
        load_dotenv(dotenv_path=p)
        break

try:
    from pymongo import MongoClient
except ImportError:
    print("[Error] PyMongo is required. Run: pip install pymongo")
    exit(1)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "logistics_db")


def run_analytics_report():
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        db = client[MONGO_DATABASE]
        client.admin.command('ping')
    except Exception as e:
        print(f"[PyMongo Analytics Error] Unable to connect to MongoDB ({e}).")
        return

    print("=" * 60)
    print(" PyMongo Logistics Analytics & Aggregation Report")
    print(f" Database: {MONGO_DATABASE} | Time: {datetime.utcnow().isoformat()}")
    print("=" * 60)

    # 1. Total Activity Logs
    total_logs = db.activity_logs.count_documents({})
    print(f"\n1. Total System Activity Logs: {total_logs}")

    # 2. Inventory Aggregation by Location
    print("\n2. Inventory Valuation & Quantity by Location (PyMongo Pipeline):")
    pipeline = [
        {
            "$group": {
                "_id": "$location",
                "totalItems": {"$sum": "$quantity"},
                "totalValue": {"$sum": {"$multiply": ["$quantity", "$price"]}},
                "productCount": {"$sum": 1}
            }
        },
        {"$sort": {"totalValue": -1}}
    ]

    results = list(db.inventory.aggregate(pipeline))
    if results:
        print(f"{'Location':<25} {'Distinct SKUs':<15} {'Total Units':<15} {'Valuation ($)':<15}")
        print("-" * 70)
        for r in results:
            loc = r["_id"] or "Unassigned Hub"
            print(f"{loc:<25} {r['productCount']:<15} {r['totalItems']:<15} {r['totalValue']:<15.2f}")
    else:
        print("   No inventory data available to aggregate.")

    # 3. Export to JSON file in database folder
    export_data = {
        "exportTimestamp": datetime.utcnow().isoformat(),
        "database": MONGO_DATABASE,
        "logs": list(db.activity_logs.find({}, {"_id": 0}).limit(100)),
        "inventory": list(db.inventory.find({}, {"_id": 0})),
        "orderTracking": list(db.order_tracking.find({}, {"_id": 0}))
    }

    out_file = os.path.join(current_dir, "export_snapshot.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)

    print(f"\n✓ Analytics report complete. Snapshot exported to {out_file}\n")


if __name__ == "__main__":
    run_analytics_report()
