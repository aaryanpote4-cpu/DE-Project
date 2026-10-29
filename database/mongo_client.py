#!/usr/bin/env python3
"""
Delivery & Logistics Optimizer: PyMongo Database Manager
Handles all NoSQL collections (activity_logs, order_tracking, inventory) via PyMongo.
Can be imported as a module or executed directly as an interactive CLI management tool.
Usage: python database/mongo_client.py
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from backend/.env or local .env
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
    import pymongo
    from pymongo import MongoClient
except ImportError:
    print("[Error] PyMongo is not installed. Install with: pip install pymongo")
    sys.exit(1)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DATABASE", "logistics_db")


class LogisticsMongoManager:
    def __init__(self, uri=MONGO_URI, db_name=MONGO_DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=3000)
            self.db = self.client[self.db_name]
            # Ping database to confirm connection
            self.client.admin.command('ping')
            print(f"[PyMongo] Connected successfully to MongoDB: {self.db_name} at {self.uri}")
            return True
        except Exception as e:
            print(f"[PyMongo Warning] Unable to connect to MongoDB ({e}). Verify your MONGO_URI in .env.")
            self.client = None
            self.db = None
            return False

    def is_connected(self):
        return self.db is not None

    # -------------------------------------------------------------
    # 1. Activity Logs Collection
    # -------------------------------------------------------------
    def log_activity(self, action: str, level: str = "INFO", metadata: dict = None):
        """Append an event log into the activity_logs collection using PyMongo."""
        if not self.is_connected():
            return None
        doc = {
            "action": action,
            "level": level,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        res = self.db.activity_logs.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        return doc

    def get_activity_logs(self, limit: int = 50):
        """Retrieve the most recent activity logs sorted chronologically descending."""
        if not self.is_connected():
            return []
        cursor = self.db.activity_logs.find({}).sort("timestamp", pymongo.DESCENDING).limit(limit)
        logs = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            logs.append(doc)
        return logs

    # -------------------------------------------------------------
    # 2. Order Tracking & Route Telemetry Collection
    # -------------------------------------------------------------
    def upsert_order_tracking(self, order_id: str, tracking_data: dict):
        """Store or update full simulated route, waypoints, and timeline for an order."""
        if not self.is_connected():
            return None
        tracking_data["orderId"] = str(order_id)
        tracking_data["updatedAt"] = datetime.utcnow().isoformat()
        self.db.order_tracking.update_one(
            {"orderId": str(order_id)},
            {"$set": tracking_data},
            upsert=True
        )
        return tracking_data

    def get_order_tracking(self, order_id: str):
        """Query tracking history for a specific order."""
        if not self.is_connected():
            return None
        doc = self.db.order_tracking.find_one({"orderId": str(order_id)})
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    # -------------------------------------------------------------
    # 3. Inventory Collection
    # -------------------------------------------------------------
    def get_inventory(self):
        """Retrieve all inventory catalog items from MongoDB."""
        if not self.is_connected():
            return []
        items = []
        for doc in self.db.inventory.find({}):
            doc["_id"] = str(doc["_id"])
            items.append(doc)
        return items

    def add_inventory_item(self, item_id: str, name: str, quantity: int, price: float, location: str = "Central Warehouse"):
        """Add or update an item in the MongoDB inventory."""
        if not self.is_connected():
            return None
        doc = {
            "id": item_id,
            "name": name,
            "quantity": int(quantity),
            "price": float(price),
            "location": location,
            "status": "In Stock" if quantity > 0 else "Out of Stock",
            "updatedAt": datetime.utcnow().isoformat()
        }
        self.db.inventory.update_one({"id": item_id}, {"$set": doc}, upsert=True)
        return doc

    def update_stock(self, item_id: str, delta: int):
        """Atomically increment or decrement stock count using PyMongo $inc operator."""
        if not self.is_connected():
            return None
        res = self.db.inventory.find_one_and_update(
            {"id": item_id},
            {"$inc": {"quantity": int(delta)}, "$set": {"updatedAt": datetime.utcnow().isoformat()}},
            return_document=pymongo.ReturnDocument.AFTER
        )
        if res and "_id" in res:
            res["_id"] = str(res["_id"])
        return res


def print_cli_menu():
    print("\n" + "="*55)
    print(" Delivery & Logistics Optimizer - PyMongo Console")
    print("="*55)
    print("1. View Recent Activity Logs")
    print("2. Add Test Activity Log")
    print("3. View Inventory Collection")
    print("4. Update Item Stock")
    print("5. View Order Tracking History")
    print("6. Exit")
    print("="*55)


def main():
    manager = LogisticsMongoManager()
    if not manager.is_connected():
        print("\n[Notice] MongoDB is currently offline or unreachable.")
        print(f"Connection URI configured: {MONGO_URI}")
        print("Please ensure MongoDB daemon is running (`mongod`) or provide your MongoDB Atlas URI in backend/.env.")
        return

    while True:
        print_cli_menu()
        choice = input("Select an option (1-6): ").strip()

        if choice == "1":
            logs = manager.get_activity_logs(10)
            print(f"\n--- Latest {len(logs)} Activity Logs (PyMongo) ---")
            for l in logs:
                print(f"[{l.get('timestamp')[:19]}] [{l.get('level')}] {l.get('action')}")

        elif choice == "2":
            action = input("Enter log action text: ").strip()
            if action:
                doc = manager.log_activity(action, level="INFO", metadata={"source": "PyMongo CLI"})
                print(f"Logged successfully: ID={doc['_id']}")

        elif choice == "3":
            items = manager.get_inventory()
            print(f"\n--- Inventory ({len(items)} items) ---")
            print(f"{'ID':<10} {'Name':<25} {'Quantity':<10} {'Price ($)':<10} {'Status':<12}")
            print("-" * 67)
            for it in items:
                print(f"{it.get('id', ''):<10} {it.get('name', ''):<25} {it.get('quantity', 0):<10} {it.get('price', 0.0):<10.2f} {it.get('status', ''):<12}")

        elif choice == "4":
            item_id = input("Enter Item ID (e.g. PRD-001): ").strip()
            qty = input("Enter quantity to add (use negative to decrease): ").strip()
            try:
                updated = manager.update_stock(item_id, int(qty))
                if updated:
                    print(f"Stock updated for {item_id}: New quantity = {updated.get('quantity')}")
                else:
                    print(f"Item {item_id} not found.")
            except ValueError:
                print("Invalid quantity number.")

        elif choice == "5":
            order_id = input("Enter Order ID to inspect (e.g. 1): ").strip()
            track = manager.get_order_tracking(order_id)
            if track:
                print(f"\nOrder #{order_id} Tracking Document:")
                for k, v in track.items():
                    print(f"  {k}: {v}")
            else:
                print(f"No tracking record found for order #{order_id}.")

        elif choice == "6":
            print("Exiting PyMongo console.")
            break
        else:
            print("Invalid choice, please select 1-6.")


if __name__ == "__main__":
    main()
