# 📊 Database Changes & Architecture Specification (Logistics & Warehouse Management)

This document details the database architecture, schema definitions, relationships, and migration rationale for the **Logistics & Warehouse Management System**. It is designed to be directly referenced during presentations and technical demonstrations.

---

## 🏗️ 1. Architecture Summary

The system is powered by a **Relational + Graph Topology** schema in MySQL with seamless in-memory resilience:

| Entity | Primary Purpose | Key Fields | Relationship |
| :--- | :--- | :--- | :--- |
| **`warehouses`** | Physical fulfillment hubs across India | `id`, `code`, `name`, `city`, `state`, `lat`, `lng`, `total_capacity_sqft`, `used_capacity_sqft`, `status` | 1-to-many with `inventory`, 1-to-many with `edges`, 1-to-many with `shipments` |
| **`inventory`** | Products stocked per warehouse | `id`, `warehouse_id`, `sku`, `name`, `category`, `quantity`, `unit_price`, `status` | Belongs to `warehouses` (CASCADE on delete), unique per `(warehouse_id, sku)` |
| **`users`** | Role-based authentication | `id`, `username`, `email`, `password_hash`, `role`, `full_name` | Roles: `admin`, `manager`, `customer` |
| **`edges`** | Weighted road transit routes for Dijkstra Engine | `id`, `source`, `destination`, `distance` | Foreign keys to `warehouses(id)` |
| **`shipments`** | Dispatch orders with real-time lifecycle tracking | `id`, `tracking_number`, `source_warehouse_id`, `dest_warehouse_id`, `status`, `urgency`, `distance` | Foreign keys to `warehouses(id)` |

---

## 📋 2. Detailed Table Structure & Rationale

### A. `warehouses` Table
- **Purpose**: Represents map nodes and distribution centers across India.
- **Coordinates**: Stores high-precision `lat` (latitude) and `lng` (longitude) in `DOUBLE` format to avoid truncation and enable exact Leaflet map rendering.
- **Capacity Utilisation**:
  - `total_capacity_sqft`: Total warehouse square footage.
  - `used_capacity_sqft`: Currently occupied square footage.
  - `status`: Automatically color-coded on the map:
    - `available` (Green): Capacity used < 70%
    - `near_full` (Orange): Capacity used 70% – 90%
    - `full` (Red): Capacity used > 90%
- **Indexes**: Indexed on `city` and `status` for instant live filtering without table scans.

### B. `inventory` Table
- **Purpose**: Real-time stock counts, product categories, and pricing at individual warehouses.
- **Relational Integrity**:
  ```sql
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
  UNIQUE KEY uq_warehouse_sku (warehouse_id, sku)
  ```
- **Live Queries**:
  - `GET /api/warehouses/:id/inventory` fetches all products stored at that specific facility.
  - Updating stock updates `last_updated` via `TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.

### C. `users` Table
- **Purpose**: Enterprise role-based security.
- **Password Security**: Uses bcrypt salt and hash (cost factor 10) in `password_hash VARCHAR(255)`. No plaintext passwords stored.
- **Roles**:
  - `admin`: Full system control, database view, user management, and configuration.
  - `manager`: Warehouse inventory editing, dispatches, and capacity adjustments.
  - `customer`: Order tracking, shipment creation, and public warehouse map.

### D. `edges` Table (Dijkstra Highway Graph)
- **Purpose**: Supplies the C++ routing engine and native Dijkstra algorithms with weighted transit distances (km) between Indian logistics vertices (e.g. Golden Quadrilateral, NH-44, NH-48).

### E. `shipments` / `orders` Table
- **Purpose**: FIFO and priority queue dispatch system.
- **Lifecycle Statuses**: `Pending` ➔ `In-Transit` ➔ `Delivered`.

---

## 🚀 3. How to Create and Seed the Database

Run this single command from your terminal:
```bash
# Using Node.js automated seeder:
node backend/scripts/seed_mysql.js

# Or directly in MySQL CLI / Workbench:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 🔍 4. Verification Queries for Presentation Demo

```sql
-- 1. View all 14 Indian warehouses sorted by capacity utilization:
SELECT id, code, name, city, state, 
       ROUND((used_capacity_sqft / total_capacity_sqft) * 100, 1) AS utilization_pct,
       status 
FROM warehouses 
ORDER BY utilization_pct DESC;

-- 2. Inspect inventory items inside Mumbai Port Gateway (ID: 2):
SELECT sku, name, category, quantity, unit_price, status 
FROM inventory 
WHERE warehouse_id = 2;

-- 3. Check active shipments in transit:
SELECT s.tracking_number, 
       w1.city AS source_city, 
       w2.city AS destination_city, 
       s.urgency, s.distance, s.status 
FROM shipments s
JOIN warehouses w1 ON s.source_warehouse_id = w1.id
JOIN warehouses w2 ON s.dest_warehouse_id = w2.id
WHERE s.status = 'In-Transit';
```
