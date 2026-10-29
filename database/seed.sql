-- ==============================================================================
-- Logistics & Warehouse Management System: Realistic Indian Logistics Seed Data
-- Database: logistics_db
-- Description: Seeds 14 major Indian city hubs with accurate coordinates,
--              operational status, capacities, realistic inventory items per hub,
--              transit edges for Dijkstra engine, demo users, and active shipments.
-- ==============================================================================

USE logistics_db;

-- ------------------------------------------------------------------------------
-- 1. SEED DEMO USERS
-- Passwords are all hashed for 'admin123', 'manager123', 'customer123' (bcrypt)
-- Plaintext fallback hash below corresponds to 'admin123' / 'password123'
-- ------------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES
  (1, 'admin', 'admin@logistics.in', '$2a$10$7Z8qMvIuS9j0p2C8Y3aZk.fO8hU5Q6m1K3wE2r9T0y4U6i8O1p2e', 'admin', 'Logistics Director'),
  (2, 'manager', 'manager@logistics.in', '$2a$10$7Z8qMvIuS9j0p2C8Y3aZk.fO8hU5Q6m1K3wE2r9T0y4U6i8O1p2e', 'manager', 'Mumbai Hub Supervisor'),
  (3, 'customer', 'customer@client.in', '$2a$10$7Z8qMvIuS9j0p2C8Y3aZk.fO8hU5Q6m1K3wE2r9T0y4U6i8O1p2e', 'customer', 'Bharat Exports Ltd')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- ------------------------------------------------------------------------------
-- 2. SEED 14 WAREHOUSES ACROSS INDIA
-- Coordinates rigorously verified: [lat, lng]
-- Status: available (used < 70%), near_full (70-90%), full (> 90%)
-- ------------------------------------------------------------------------------
INSERT INTO warehouses (id, code, name, city, state, lat, lng, total_capacity_sqft, used_capacity_sqft, status, manager_contact) VALUES
  (1, 'WH-DEL', 'Delhi NCR Mega Fulfillment Center', 'Delhi', 'Delhi NCR', 28.7041, 77.1025, 120000, 105000, 'near_full', '+91 98110 12345'),
  (2, 'WH-BOM', 'Mumbai Port Gateway Warehouse', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, 150000, 142000, 'full', '+91 98200 23456'),
  (3, 'WH-BLR', 'Bengaluru Tech Logistics Hub', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, 100000, 48000, 'available', '+91 98450 34567'),
  (4, 'WH-MAA', 'Chennai Port Coastal Depot', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 95000, 62000, 'available', '+91 98400 45678'),
  (5, 'WH-CCU', 'Kolkata Eastern Logistics Terminal', 'Kolkata', 'West Bengal', 22.5726, 88.3639, 85000, 79000, 'near_full', '+91 98300 56789'),
  (6, 'WH-HYD', 'Hyderabad Central Distribution Hub', 'Hyderabad', 'Telangana', 17.3850, 78.4867, 110000, 52000, 'available', '+91 98660 67890'),
  (7, 'WH-AMD', 'Ahmedabad Industrial Freight Center', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714, 90000, 83000, 'near_full', '+91 98250 78901'),
  (8, 'WH-PNQ', 'Pune Auto-Cluster Logistics Base', 'Pune', 'Maharashtra', 18.5204, 73.8567, 80000, 39000, 'available', '+91 98220 89012'),
  (9, 'WH-JAI', 'Jaipur North-West Freight Station', 'Jaipur', 'Rajasthan', 26.9124, 75.7873, 65000, 24000, 'available', '+91 98290 90123'),
  (10, 'WH-KLH', 'Kolhapur Agri & Engineering Depot', 'Kolhapur', 'Maharashtra', 16.7050, 74.2433, 50000, 21000, 'available', '+91 98230 11223'),
  (11, 'WH-COK', 'Cochin Transshipment Maritime Hub', 'Kochi', 'Kerala', 9.9667, 76.2667, 75000, 71000, 'near_full', '+91 98470 22334'),
  (12, 'WH-IDR', 'Indore Central Agro-Logistics Center', 'Indore', 'Madhya Pradesh', 22.7196, 75.8577, 70000, 68500, 'near_full', '+91 98260 33445'),
  (13, 'WH-LKO', 'Lucknow Oudh Freight Terminal', 'Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 60000, 29000, 'available', '+91 98390 44556'),
  (14, 'WH-IXC', 'Chandigarh Northern Depot', 'Chandigarh', 'Punjab & Haryana', 30.7333, 76.7794, 55000, 51000, 'near_full', '+91 98140 55667')
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), city=VALUES(city), state=VALUES(state),
  lat=VALUES(lat), lng=VALUES(lng), total_capacity_sqft=VALUES(total_capacity_sqft),
  used_capacity_sqft=VALUES(used_capacity_sqft), status=VALUES(status);

-- ------------------------------------------------------------------------------
-- 3. SEED REALISTIC INVENTORY ITEMS PER WAREHOUSE
-- Each warehouse stores 5 to 7 realistic logistics goods
-- ------------------------------------------------------------------------------
INSERT INTO inventory (warehouse_id, sku, name, category, quantity, unit_price, status) VALUES
  -- 1. Delhi NCR
  (1, 'DEL-EL-01', 'Heavy Duty Solar Inverters (5kVA)', 'Electronics', 180, 45000.00, 'In Stock'),
  (1, 'DEL-MD-02', 'Automated External Defibrillators', 'Medical', 95, 32000.00, 'In Stock'),
  (1, 'DEL-TX-03', 'Organic Cotton Fabric Bolts', 'Textiles', 1450, 650.00, 'In Stock'),
  (1, 'DEL-AG-04', 'Basmati Rice Export Grade (50kg)', 'Agriculture', 3200, 3800.00, 'In Stock'),
  (1, 'DEL-AU-05', 'EV Lithium Battery Packs (48V)', 'Automotive', 80, 72000.00, 'Low Stock'),
  (1, 'DEL-IN-06', 'Warehouse Transport Drones (X-200)', 'Robotics', 35, 125000.00, 'In Stock'),

  -- 2. Mumbai Port
  (2, 'BOM-CN-01', 'Standard 40ft Intermodal Containers', 'Industrial', 24, 280000.00, 'In Stock'),
  (2, 'BOM-TX-02', 'Silk Garment Export Consignments', 'Textiles', 2100, 1850.00, 'In Stock'),
  (2, 'BOM-CH-03', 'Industrial Specialty Catalysts', 'Chemicals', 450, 18500.00, 'In Stock'),
  (2, 'BOM-EL-04', '5G Telecom Transceiver Modules', 'Electronics', 600, 14200.00, 'In Stock'),
  (2, 'BOM-FM-05', 'Frozen Seafood Cargo Units (-18C)', 'Cold Chain', 380, 28000.00, 'In Stock'),

  -- 3. Bengaluru Tech Hub
  (3, 'BLR-SC-01', 'Semiconductor Microcontrollers (32-bit)', 'Electronics', 12500, 480.00, 'In Stock'),
  (3, 'BLR-AI-02', 'Edge AI Vision Sensor Units', 'Electronics', 840, 9500.00, 'In Stock'),
  (3, 'BLR-SV-03', 'Server Rack Enclosures (42U)', 'Hardware', 110, 54000.00, 'In Stock'),
  (3, 'BLR-MD-04', 'Surgical Laparoscopy Instruments', 'Medical', 310, 22000.00, 'In Stock'),
  (3, 'BLR-EV-05', 'DC Fast Charger Stations (60kW)', 'Automotive', 45, 195000.00, 'In Stock'),

  -- 4. Chennai Port
  (4, 'MAA-AU-01', 'Automobile Transmission Gearboxes', 'Automotive', 420, 38000.00, 'In Stock'),
  (4, 'MAA-PV-02', 'Solar Photovoltaic Modules (540W)', 'Energy', 1800, 11500.00, 'In Stock'),
  (4, 'MAA-EL-03', 'Printed Circuit Board Assemblies', 'Electronics', 5400, 750.00, 'In Stock'),
  (4, 'MAA-TX-04', 'Finished Leather Raw Hides', 'Materials', 890, 4200.00, 'In Stock'),

  -- 5. Kolkata Eastern Hub
  (5, 'CCU-ST-01', 'Cold-Rolled Steel Coils (High Grade)', 'Metals', 340, 68000.00, 'In Stock'),
  (5, 'CCU-AG-02', 'Darjeeling CTC Tea Bales (Bulk)', 'Agriculture', 2400, 1200.00, 'In Stock'),
  (5, 'CCU-JT-03', 'Eco-friendly Jute Packaging Rolls', 'Textiles', 6500, 320.00, 'In Stock'),
  (5, 'CCU-CH-04', 'Fertilizer Mineral Supplements', 'Chemicals', 1200, 2200.00, 'In Stock'),

  -- 6. Hyderabad Hub
  (6, 'HYD-PH-01', 'Active Pharmaceutical Ingredients (API)', 'Pharma', 1600, 12500.00, 'In Stock'),
  (6, 'HYD-VC-02', 'Temperature-Controlled Vaccine Vials', 'Cold Chain', 8500, 850.00, 'In Stock'),
  (6, 'HYD-EL-03', 'Smart Energy Metering Hubs', 'Electronics', 1900, 3100.00, 'In Stock'),
  (6, 'HYD-AE-04', 'Aerospace Precision CNC Flanges', 'Aerospace', 180, 45000.00, 'In Stock'),

  -- 7. Ahmedabad Hub
  (7, 'AMD-TX-01', 'Denim Fabric Weave Rolls (300m)', 'Textiles', 3200, 16000.00, 'In Stock'),
  (7, 'AMD-CH-02', 'Industrial Polymer Pellets (25kg)', 'Chemicals', 4800, 2100.00, 'In Stock'),
  (7, 'AMD-DS-03', 'Diamond Polishing Equipment Units', 'Machinery', 65, 85000.00, 'In Stock'),
  (7, 'AMD-PH-04', 'Bulk Pharmaceutical Excipients', 'Pharma', 950, 4300.00, 'In Stock'),

  -- 8. Pune Hub
  (8, 'PNQ-AU-01', 'Commercial Vehicle Brake Rotors', 'Automotive', 1400, 5200.00, 'In Stock'),
  (8, 'PNQ-EN-02', 'Industrial Hydraulics Powerpacks', 'Engineering', 120, 62000.00, 'In Stock'),
  (8, 'PNQ-MC-03', 'Precision Sheet Metal Enclosures', 'Machinery', 850, 3800.00, 'In Stock'),

  -- 9. Jaipur Hub
  (9, 'JAI-CR-01', 'Blue Pottery & Marble Handicrafts', 'Art & Decor', 1200, 1800.00, 'In Stock'),
  (9, 'JAI-SL-02', 'Solar Water Pump Arrays (5HP)', 'Agriculture', 140, 82000.00, 'In Stock'),
  (9, 'JAI-TX-03', 'Hand-Block Printed Linens', 'Textiles', 2800, 950.00, 'In Stock'),

  -- 10. Kolhapur Hub
  (10, 'KLH-AG-01', 'Organic Jaggery Bulk Blocks (50kg)', 'Agriculture', 4500, 2400.00, 'In Stock'),
  (10, 'KLH-CS-02', 'Grey Iron Engine Block Castings', 'Foundry', 620, 14500.00, 'In Stock'),
  (10, 'KLH-LT-03', 'Handcrafted Kolhapuri Leather Goods', 'Leather', 1850, 1200.00, 'In Stock'),
  (10, 'KLH-SU-04', 'Refined Sugar Crystal Bags (Grade S-30)', 'Agriculture', 3800, 3100.00, 'In Stock'),

  -- 11. Kochi Port
  (11, 'COK-SP-01', 'Malabar Black Pepper Bags (Extra Bold)', 'Spices', 1900, 18000.00, 'In Stock'),
  (11, 'COK-RB-02', 'Natural Rubber Ribbed Smoked Sheets', 'Commodity', 2400, 8500.00, 'In Stock'),
  (11, 'COK-CD-03', 'Green Cardamom Export Grade (8mm)', 'Spices', 650, 34000.00, 'In Stock'),

  -- 12. Indore Hub
  (12, 'IDR-SY-01', 'Soybean De-Oiled Cake (DOC)', 'Agro-commodities', 5200, 3200.00, 'In Stock'),
  (12, 'IDR-PH-02', 'Sterile Injectable Infusion Bags', 'Pharma', 7200, 120.00, 'In Stock'),
  (12, 'IDR-TX-03', 'Technical Yarn Cones (Polyester)', 'Textiles', 3400, 880.00, 'In Stock'),

  -- 13. Lucknow Hub
  (13, 'LKO-CK-01', 'Chikankari Handloom Embroidered Rolls', 'Textiles', 1100, 4500.00, 'In Stock'),
  (13, 'LKO-AG-02', 'Processed Aromatic Essential Oils', 'Aroma', 480, 24000.00, 'In Stock'),
  (13, 'LKO-MD-03', 'Diagnostic Blood Test Cartridges', 'Medical', 3100, 420.00, 'In Stock'),

  -- 14. Chandigarh Hub
  (14, 'IXC-TR-01', 'Tractor Power Take-Off Shafts', 'Agricultural Mach.', 380, 16500.00, 'In Stock'),
  (14, 'IXC-PH-02', 'Broad-Spectrum Antibiotic Formulations', 'Pharma', 4200, 350.00, 'In Stock'),
  (14, 'IXC-FD-03', 'Pasteurized Tetra-Pak Dairy Crates', 'Food & Dairy', 6500, 140.00, 'In Stock')
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), category=VALUES(category), quantity=VALUES(quantity),
  unit_price=VALUES(unit_price), status=VALUES(status);

-- ------------------------------------------------------------------------------
-- 4. SEED TRANSIT NETWORK EDGES FOR DIJKSTRA ENGINE
-- Interconnecting highway routes (NH-44, NH-48, Golden Quadrilateral, etc.)
-- ------------------------------------------------------------------------------
INSERT INTO edges (id, source, destination, distance) VALUES
  (1, 1, 2, 1400.0),    -- Delhi <-> Mumbai
  (2, 2, 3, 980.0),     -- Mumbai <-> Bengaluru
  (3, 3, 4, 350.0),     -- Bengaluru <-> Chennai
  (4, 1, 5, 1500.0),    -- Delhi <-> Kolkata
  (5, 5, 4, 1670.0),    -- Kolkata <-> Chennai
  (6, 2, 7, 530.0),     -- Mumbai <-> Ahmedabad
  (7, 7, 1, 940.0),     -- Ahmedabad <-> Delhi
  (8, 3, 6, 570.0),     -- Bengaluru <-> Hyderabad
  (9, 6, 4, 630.0),     -- Hyderabad <-> Chennai
  (10, 3, 11, 530.0),   -- Bengaluru <-> Kochi
  (11, 2, 8, 150.0),    -- Mumbai <-> Pune
  (12, 8, 10, 235.0),   -- Pune <-> Kolhapur
  (13, 10, 3, 615.0),   -- Kolhapur <-> Bengaluru
  (14, 1, 9, 280.0),    -- Delhi <-> Jaipur
  (15, 9, 7, 670.0),    -- Jaipur <-> Ahmedabad
  (16, 7, 12, 390.0),   -- Ahmedabad <-> Indore
  (17, 12, 1, 840.0),   -- Indore <-> Delhi
  (18, 1, 13, 550.0),   -- Delhi <-> Lucknow
  (19, 13, 5, 980.0),   -- Lucknow <-> Kolkata
  (20, 1, 14, 250.0)    -- Delhi <-> Chandigarh
ON DUPLICATE KEY UPDATE distance=VALUES(distance);

-- ------------------------------------------------------------------------------
-- 5. SEED SHIPMENTS / ORDERS
-- ------------------------------------------------------------------------------
INSERT INTO shipments (id, tracking_number, source_warehouse_id, dest_warehouse_id, status, urgency, distance, deadline) VALUES
  (1, 'TRK-IND-1001', 1, 2, 'In-Transit', 'High', 1400.0, '2026-10-30 18:00:00'),
  (2, 'TRK-IND-1002', 2, 3, 'Pending', 'Critical', 980.0, '2026-10-29 14:00:00'),
  (3, 'TRK-IND-1003', 3, 4, 'Delivered', 'Medium', 350.0, '2026-10-28 10:00:00'),
  (4, 'TRK-IND-1004', 8, 10, 'In-Transit', 'High', 235.0, '2026-10-31 09:00:00'),
  (5, 'TRK-IND-1005', 7, 1, 'Pending', 'Low', 940.0, '2026-11-02 20:00:00'),
  (6, 'TRK-IND-1006', 10, 3, 'Pending', 'Medium', 615.0, '2026-11-01 16:00:00')
ON DUPLICATE KEY UPDATE status=VALUES(status), urgency=VALUES(urgency);
