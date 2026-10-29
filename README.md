# 🚚 Pan-India Logistics & Warehouse Optimization Platform

**Enterprise Full-Stack Logistics Dashboard powered by React 19, Leaflet (OpenStreetMap India), Node.js/Express, a Native Dijkstra Shortest-Path Engine, and a Dual Database Architecture (MySQL Relational + MongoDB NoSQL).**

---

## 🏗️ Architecture Overview

The system combines algorithmic route optimization with high-availability database storage:

1. **Geospatial Map Engine (Leaflet + OpenStreetMap)**:
   - **Zero API Keys**: Uses standard OpenStreetMap raster tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
   - **Pan-India Bound**: Centered on India `[22.5937, 78.9629]`, bounded strictly to `[[6, 67], [37.5, 98]]` with responsive `map.invalidateSize()` handling.
   - **14 Major Freight Warehouses**: Real-world locations (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune, Jaipur, Kolhapur, Kochi, Indore, Lucknow, Chandigarh).
   - **Status & Capacity Color-Coding**:
     - 🟢 **Available** (Green): Utilisation < 70%
     - 🟠 **Near Full** (Amber): Utilisation 70% – 90%
     - 🔴 **Full** (Red): Utilisation > 90%
   - **Cluster Management**: `leaflet.markercluster` groups nearby facilities at low zoom levels.
   - **Realtime Side Panel**: Clicking any warehouse triggers a smooth `map.flyTo` and slides out an inventory drawer with live SKU counts, space utilization bar, and contact details.

2. **Relational Database (`/database/schema.sql` & `/database/seed.sql`)**:
   - `warehouses`: Geospatial hub entities with total and used square footage.
   - `inventory`: Product items, categories, unit prices, and quantities linked by foreign keys.
   - `users`: Enterprise role-based access (`admin`, `manager`, `customer`) with bcrypt-hashed passwords.
   - `edges`: Weighted highway network distances between Indian logistics vertices.
   - `shipments`: Dispatch orders with priority urgency and delivery statuses.
   - Documentation available in [`DB_CHANGES.md`](file:///c:/Users/ASUS/Desktop/DSA%20project/DB_CHANGES.md).

3. **Core Algorithmic DSA Engine (Native Dijkstra)**:
   - Built-in, high-performance Dijkstra shortest path algorithm and Priority Queue in Node.js for calculating optimal delivery routes between hubs.

4. **Security & Authentication**:
   - Split-layout authentication console with branding graphic and password visibility toggle.
   - Salted and hashed passwords via **Bcrypt** and signed **JWT bearer sessions**.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In backend:
cd backend
npm install

# In frontend:
cd ../frontend
npm install
```

---

### 2. Create & Seed the Database (Single Command)

You can seed the database with all 14 Indian Warehouses, inventory, edges, and demo users using a single command:

```bash
cd backend
npm run seed
```

*Alternatively, import directly into MySQL CLI or Workbench:*
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

> **Note on Database Fallback**: The backend includes an automatic in-memory resilient fallback. If your local MySQL service is offline or credentials are not yet configured, the server starts seamlessly and provides all 14 Indian warehouses and inventory items automatically!

---

### 3. Run the Application

#### Option A: Unified Full-Stack Server (Recommended)
Runs both the frontend dashboard, Dijkstra routing engine, and backend REST APIs on port `3000`:
```bash
cd backend
npm start
```
Open in your browser:
👉 **[http://localhost:3000](http://localhost:3000)** *(or http://127.0.0.1:3000)*

#### Option B: Vite Frontend Dev Server (with Hot Reload)
```bash
cd frontend
npm run dev
```
Open in your browser:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🎭 How to Demo the Project for Presentations

1. **Sign In**:
   - Open **[http://localhost:3000](http://localhost:3000)**.
   - Click **"Get Started"** or navigate to `/auth`.
   - Use the **Quick Demo Autofill Buttons**:
     - 🛡️ **Admin**: `admin@logistics.in` / `admin123`
     - 🏬 **Manager**: `manager@logistics.in` / `manager123`
     - 🚚 **Customer**: `customer@client.in` / `customer123`
2. **Explore the Pan-India Map (`/map`)**:
   - View all 14 Indian Warehouses marked with custom status-colored pins.
   - Filter by status (**Available**, **Near Full**, **Full**) or type a city in the live search bar (e.g. *"Kolhapur"*, *"Mumbai"*, *"Bengaluru"*).
   - Click on any warehouse marker: watch the map smoothly fly to the city and the right-hand **Inventory Drawer** open with SKUs, categories, and space utilization bar.
3. **Show Database Changes in Real Time (`/database-view`)**:
   - Click **"Database Live View"** in the top navigation bar.
   - Switch between live tabs: `warehouses`, `inventory`, `orders`, `edges`, and `users`.
   - Click **"Refresh Tables"** to demonstrate live database synchronization.
4. **Order Dispatch & Dijkstra Routing (`/orders`)**:
   - View the FIFO/Priority order queue.
   - Click **"Dispatch Order"** to trigger the Dijkstra shortest path routing engine and watch the animated truck follow the highway route across India.
