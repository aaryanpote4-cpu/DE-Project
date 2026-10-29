/**
 * Delivery & Logistics Optimizer - Route Aggregator
 * 
 * NOTE: The monolithic routes have been modularized into separate files:
 *  - backend/routes/auth.js        -> User registration, JWT login, profile
 *  - backend/routes/warehouses.js  -> Indian warehouse hubs, capacities, statuses
 *  - backend/routes/locations.js   -> Geographic location vertices
 *  - backend/routes/edges.js       -> Graph edges & road transit distances
 *  - backend/routes/orders.js      -> Order queue & priority dispatch engine
 *  - backend/routes/routing.js     -> Shortest-path route calculation
 *  - backend/routes/inventory.js   -> Stock, restock, dispatch management
 *  - backend/routes/analytics.js   -> Audit logs, tracking timeline, health checks
 *  - backend/services/dijkstra.js  -> Dijkstra shortest-path pathfinding algorithm
 */

module.exports = require('./routes/index');
