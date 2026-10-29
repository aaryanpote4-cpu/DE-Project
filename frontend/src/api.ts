export interface Location {
  id: string;
  code?: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Edge {
  id?: string;
  source: string;
  destination: string;
  distance: number;
}

export interface Order {
  id: string;
  source: string;
  destination: string;
  status: 'Pending' | 'In Transit' | 'Delivered';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string;
  distance: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  location?: string;
  status?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  level: string;
  timestamp: string;
  metadata?: any;
}

export interface OrderTracking {
  orderId: string;
  source: string;
  destination: string;
  status: string;
  route?: { distance: number; path: string[] };
  completedAt?: string;
  timeline?: { status: string; timestamp: string; note: string }[];
  updatedAt?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  total_capacity_sqft: number;
  used_capacity_sqft: number;
  utilization: number;
  status: 'available' | 'near_full' | 'full' | 'maintenance';
  manager_contact?: string;
}

export interface WarehouseInventoryItem {
  id: number;
  warehouse_id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit_price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Dispatched';
  last_updated?: string;
}

export interface DatabaseSnapshot {
  connected: boolean;
  engine: string;
  tables: {
    warehouses: { count: number; rows: any[] };
    inventory: { count: number; rows: any[] };
    orders: { count: number; rows: any[] };
    edges: { count: number; rows: any[] };
    users: { count: number; rows: any[] };
  };
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'customer';
  full_name?: string;
}

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? `http://${window.location.hostname}:3000/api`
  : '/api';

// -------------------------------------------------------------
// LOCAL IN-MEMORY MOCK STORE (Fallback if Backend is Offline)
// -------------------------------------------------------------
let mockLocations: Location[] = [
  { id: '1', code: 'DL', name: 'Delhi NCR Hub', lat: 28.7041, lng: 77.1025 },
  { id: '2', code: 'MU', name: 'Mumbai Port', lat: 19.0760, lng: 72.8777 },
  { id: '3', code: 'BL', name: 'Bangalore Tech Park', lat: 12.9716, lng: 77.5946 },
  { id: '4', code: 'CH', name: 'Chennai Port', lat: 13.0827, lng: 80.2707 },
  { id: '5', code: 'KO', name: 'Kolkata Port', lat: 22.5726, lng: 88.3639 },
  { id: '6', code: 'HYD', name: 'Hyderabad Warehouse', lat: 17.3850, lng: 78.4867 },
  { id: '7', code: 'AHM', name: 'Ahmedabad Hub', lat: 23.0225, lng: 72.5714 },
  { id: '8', code: 'COCHIN', name: 'Cochin Port', lat: 9.9667, lng: 76.2667 }
];

let mockEdges: Edge[] = [
  { id: '1', source: '1', destination: '2', distance: 1400 },
  { id: '2', source: '2', destination: '3', distance: 980 },
  { id: '3', source: '3', destination: '4', distance: 350 },
  { id: '4', source: '1', destination: '5', distance: 1500 },
  { id: '5', source: '5', destination: '4', distance: 1670 },
  { id: '6', source: '2', destination: '7', distance: 530 },
  { id: '7', source: '7', destination: '1', distance: 940 },
  { id: '8', source: '3', destination: '6', distance: 570 },
  { id: '9', source: '6', destination: '4', distance: 630 },
  { id: '10', source: '3', destination: '8', distance: 500 }
];

const loadLocal = (key: string, def: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : def;
  } catch {
    return def;
  }
};

const saveLocal = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// -------------------------------------------------------------
// Locations (MySQL Backend)
// -------------------------------------------------------------
export const getLocations = async (): Promise<Location[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/locations`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        mockLocations = data.map(l => ({ ...l, id: String(l.id) }));
        return mockLocations;
      }
    }
  } catch {}
  return mockLocations;
};

export const addLocation = async (data: Omit<Location, 'id'>): Promise<Location> => {
  try {
    const res = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      return { ...created, id: String(created.id) };
    }
  } catch {}
  const newLoc = { ...data, id: (mockLocations.length + 1).toString() };
  mockLocations.push(newLoc);
  return newLoc;
};

// -------------------------------------------------------------
// Edges (MySQL Backend)
// -------------------------------------------------------------
export const getEdges = async (): Promise<Edge[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/edges`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        mockEdges = data.map(e => ({
          ...e,
          id: String(e.id),
          source: String(e.source),
          destination: String(e.destination)
        }));
        return mockEdges;
      }
    }
  } catch {}
  return mockEdges;
};

export const addEdge = async (data: Omit<Edge, 'id'>): Promise<Edge> => {
  try {
    const res = await fetch(`${API_BASE_URL}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      return {
        ...created,
        id: String(created.id),
        source: String(created.source),
        destination: String(created.destination)
      };
    }
  } catch {}
  const newEdge = { ...data, id: `e${mockEdges.length + 1}` };
  mockEdges.push(newEdge);
  return newEdge;
};

// -------------------------------------------------------------
// Orders (MySQL + MongoDB Tracking)
// -------------------------------------------------------------
export const getOrders = async (): Promise<{ statuses: Record<string, string>, queue: Order[] }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (res.ok) {
      const data = await res.json();
      const stringifiedQueue: Order[] = (data.queue || []).map((o: any) => ({
        ...o,
        id: String(o.id),
        source: String(o.source),
        destination: String(o.destination)
      }));
      return { statuses: data.statuses || {}, queue: stringifiedQueue };
    }
  } catch {}

  const mockOrders: Order[] = loadLocal('mockOrders', []);
  const statuses: Record<string, string> = loadLocal('statuses', {});
  const pendingQueue = mockOrders.filter(o => o.status === 'Pending');

  return { statuses, queue: pendingQueue };
};

export const addOrder = async (data: { source: string, destination: string, urgency?: string, deadlineHrs?: number }): Promise<Order> => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      return {
        ...created,
        id: String(created.id),
        source: String(created.source),
        destination: String(created.destination)
      };
    }
  } catch {}

  const urgencyList = ['Low', 'Medium', 'High', 'Critical'];
  const urgency = data.urgency || urgencyList[Math.floor(Math.random() * urgencyList.length)];
  const deadlineHrs = data.deadlineHrs || (Math.floor(Math.random() * 48) + 12);
  const deadline = new Date(Date.now() + deadlineHrs * 3600000).toISOString();
  const pathData = await getShortestPath(data.source, data.destination);

  const mockOrders: Order[] = loadLocal('mockOrders', []);
  const statuses: Record<string, string> = loadLocal('statuses', {});
  let orderIdCounter = loadLocal('orderIdCounter', 100);

  const newOrder: Order = {
    id: `ORD-${orderIdCounter++}`,
    source: data.source,
    destination: data.destination,
    status: 'Pending',
    urgency: urgency as any,
    deadline,
    distance: pathData.distance
  };
  mockOrders.push(newOrder);
  statuses[newOrder.id] = 'Pending';

  saveLocal('mockOrders', mockOrders);
  saveLocal('statuses', statuses);
  saveLocal('orderIdCounter', orderIdCounter);
  return newOrder;
};

export const processOrder = async (): Promise<{ order: Order | undefined, route: { distance: number, path: string[] } }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/process-order`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      const order: Order = {
        ...data.order,
        id: String(data.order.id),
        source: String(data.order.source),
        destination: String(data.order.destination)
      };
      const route = {
        distance: data.route.distance,
        path: (data.route.path || []).map((p: any) => String(p))
      };
      saveLocal('activeRoute', route);
      return { order, route };
    }
  } catch {}

  const mockOrders: Order[] = loadLocal('mockOrders', []);
  const statuses: Record<string, string> = loadLocal('statuses', {});
  const { queue } = await getOrders();
  const nextOrder = queue[0];
  if (!nextOrder) throw new Error("No pending orders to process");

  const orderIdx = mockOrders.findIndex(o => String(o.id) === String(nextOrder.id));
  if (orderIdx > -1) mockOrders[orderIdx].status = 'Delivered';
  nextOrder.status = 'Delivered';
  statuses[nextOrder.id] = 'Delivered';

  saveLocal('mockOrders', mockOrders);
  saveLocal('statuses', statuses);

  const pathData = await getShortestPath(nextOrder.source, nextOrder.destination);
  saveLocal('activeRoute', pathData);

  return {
    order: nextOrder,
    route: pathData
  };
};

export const getActiveRoute = async (): Promise<{ distance: number, path: string[] } | null> => {
  return loadLocal('activeRoute', null);
};

export const getShortestPath = async (source: string, destination: string): Promise<{ distance: number, path: string[] }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/shortest-path?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        distance: data.distance,
        path: (data.path || []).map((p: any) => String(p))
      };
    }
  } catch {}

  return { distance: 1400, path: [source, destination] };
};

// -------------------------------------------------------------
// Inventory (MongoDB via PyMongo-compatible Backend)
// -------------------------------------------------------------
export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return loadLocal('mockInventory', [
    { id: 'PRD-001', name: 'Industrial Drones', quantity: 45, price: 1200.0, location: 'Delhi NCR Hub', status: 'In Stock' },
    { id: 'PRD-002', name: 'Freight Containers', quantity: 12, price: 3500.0, location: 'Mumbai Port', status: 'In Stock' },
    { id: 'PRD-003', name: 'Electronic Parts', quantity: 1500, price: 15.5, location: 'Bangalore Tech Park', status: 'In Stock' }
  ]);
};

export const addInventoryItem = async (data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  const items = await getInventory();
  const newItem = { ...data, id: `PRD-00${items.length + 1}` };
  items.push(newItem);
  saveLocal('mockInventory', items);
  return newItem;
};

export const buyInventoryItem = async (itemId: string, quantity: number): Promise<InventoryItem> => {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  const items = await getInventory();
  const item = items.find(i => i.id === itemId);
  if (item) item.quantity += quantity;
  saveLocal('mockInventory', items);
  return item!;
};

export const sellInventoryItem = async (itemId: string, quantity: number): Promise<InventoryItem> => {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  const items = await getInventory();
  const item = items.find(i => i.id === itemId);
  if (item) item.quantity = Math.max(0, item.quantity - quantity);
  saveLocal('mockInventory', items);
  return item!;
};

// -------------------------------------------------------------
// Activity Logs & Tracking (MongoDB PyMongo Endpoints)
// -------------------------------------------------------------
export const getActivityLogs = async (limit: number = 50): Promise<ActivityLog[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/logs?limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return [
    { id: '1', action: 'System operating with MySQL & MongoDB architecture', level: 'INFO', timestamp: new Date().toISOString() }
  ];
};

export const getOrderTracking = async (orderId: string | number): Promise<OrderTracking | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/tracking/${orderId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
};

export const getSystemHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { status: 'offline' };
};

// -------------------------------------------------------------
// Indian Warehouses & Inventory Endpoints
// -------------------------------------------------------------
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouses`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching warehouses:', err);
  }
  return [];
};

export const getWarehouseById = async (id: number | string): Promise<Warehouse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouses/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`Error fetching warehouse #${id}:`, err);
  }
  return null;
};

export const getWarehouseInventory = async (warehouseId: number | string): Promise<WarehouseInventoryItem[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/inventory`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`Error fetching inventory for warehouse #${warehouseId}:`, err);
  }
  return [];
};

export const addWarehouseInventoryItem = async (
  warehouseId: number | string,
  item: {
    name: string;
    sku?: string;
    category?: string;
    quantity: number;
    unit_price?: number;
    status?: string;
  }
): Promise<WarehouseInventoryItem> => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add item to warehouse inventory');
  }
  return await res.json();
};

export const deleteWarehouseInventoryItem = async (itemId: number | string): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/warehouses/inventory/${itemId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete inventory item');
  }
  return await res.json();
};

export const getAllWarehouseInventory = async (): Promise<WarehouseInventoryItem[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching all warehouse inventory:', err);
  }
  return [];
};

export const getDatabaseSnapshot = async (): Promise<DatabaseSnapshot | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/database-view`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching database snapshot:', err);
  }
  return null;
};

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
export const loginUser = async (email: string, password: string):Promise<{ user: AuthUser; token: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign in');
  }
  return data;
};

export const registerUser = async (payload: { username: string; email: string; password: string; role: string; full_name?: string }): Promise<{ user: AuthUser; token: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register account');
  }
  return data;
};

export const getCurrentUser = async (token: string): Promise<AuthUser | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {}
  return null;
};

