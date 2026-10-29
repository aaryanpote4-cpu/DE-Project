-- ==============================================================================
-- Logistics & Warehouse Management System: Relational Schema
-- Database: logistics_db
-- Description: Complete schema for Indian warehouse network, inventory management,
--              user access control, and shipment dispatch queues.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS logistics_db;
USE logistics_db;

-- ------------------------------------------------------------------------------
-- 1. USERS & ACCESS CONTROL TABLE
-- Supports role-based access: Admin, Warehouse Manager, Customer
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'customer') DEFAULT 'customer',
  full_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 2. WAREHOUSES TABLE (Major Indian Hubs & Vertices)
-- Tracks geospatial coordinates, storage capacities, state, and operational status
-- ------------------------------------------------------------------------------
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_warehouses_city (city),
  INDEX idx_warehouses_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 3. INVENTORY / PRODUCTS TABLE
-- Relational inventory linked directly to parent warehouse by foreign key
-- ------------------------------------------------------------------------------
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
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_warehouse_sku (warehouse_id, sku),
  INDEX idx_inventory_category (category),
  INDEX idx_inventory_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 4. TRANSIT EDGES (Road Network Weights for Dijkstra Algorithm)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source INT NOT NULL,
  destination INT NOT NULL,
  distance DOUBLE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (destination) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 5. SHIPMENTS / ORDERS (FIFO & Priority Dispatch Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_number VARCHAR(100) NOT NULL UNIQUE,
  source_warehouse_id INT NOT NULL,
  dest_warehouse_id INT NOT NULL,
  status ENUM('Pending', 'In-Transit', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  distance DOUBLE DEFAULT 0,
  deadline DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (dest_warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  INDEX idx_shipments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
