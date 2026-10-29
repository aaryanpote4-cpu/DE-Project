# 🗄️ Database Architecture, Schemas & Scripts

This folder contains the complete relational schema, test seed data, Node.js seeder scripts, and Python PyMongo database tools for the **Delivery & Logistics Optimizer Platform**.

---

## 📁 Files in this Database Section

| File | Language | Purpose |
| :--- | :--- | :--- |
| **`schema.sql`** | SQL | Complete DDL statements creating `logistics_db` and the 5 core relational tables (`users`, `warehouses`, `inventory`, `edges`, `shipments`). |
| **`seed.sql`** | SQL | Production-ready seed data containing 14 major Indian logistics hubs, 26 interstate transit edges, 35+ inventory SKUs, demo users, and pending orders. |
| **`seed_mysql.js`** | JavaScript (Node.js) | Automated seeder that connects to MySQL and executes both `schema.sql` and `seed.sql` in sequence. |
| **`seed_database.py`** | Python | Dual database seeder that populates MySQL relational tables and MongoDB collections (`inventory`, `activity_logs`) using PyMongo. |
| **`mongo_client.py`** | Python | PyMongo client module and interactive CLI tool for managing MongoDB NoSQL collections, inspecting order tracking, and updating item stock. |
| **`sync_export.py`** | Python | PyMongo analytics & aggregation pipeline script that computes location stock valuations and exports snapshots to JSON. |
| **`requirements.txt`** | Text | Python pip requirements for database operations (`pymongo`, `mysql-connector-python`, `python-dotenv`). |

---

## 🚀 How to Run the Database Scripts

### 1. Automated JavaScript Seeder (Node.js)
From the project root:
```bash
node database/seed_mysql.js
```
*(Or run `npm run seed`)*

### 2. Python Dual Database Seeder (MySQL + MongoDB)
First install Python requirements if using Python:
```bash
pip install -r database/requirements.txt
python database/seed_database.py
```

### 3. Interactive PyMongo Console (MongoDB)
```bash
python database/mongo_client.py
```

### 4. PyMongo Analytics & Export Reporter
```bash
python database/sync_export.py
```

### 5. Direct MySQL CLI or Workbench
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 🛡️ Resilient In-Memory Fallback
The backend Node.js application (`backend/server.js`) includes an automatic in-memory fallback. If MySQL or MongoDB is not running on your computer, the application automatically boots an in-memory replica with all 14 warehouses, inventory, and edges so you can test all features without database setup errors.
