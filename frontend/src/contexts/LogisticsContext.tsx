/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Location } from '../api'; 

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  location: string; 
  status: 'In Stock' | 'Packed' | 'Dispatched';
}

export interface Driver {
  id: string;
  name: string;
  status: 'Available' | 'On Route' | 'Off Duty';
  vehicleId?: string;
  rating: number;
}

export interface Vehicle {
  id: string;
  type: string;
  licensePlate: string;
  capacity: string;
  status: 'Active' | 'Maintenance';
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
}

export type UserRole = 'customer' | 'manager' | 'admin' | null;

export interface ContextUser {
  id: number;
  username: string;
  email: string;
  role: 'customer' | 'manager' | 'admin';
  full_name?: string;
}

interface LogisticsContextType {
  isAuthenticated: boolean;
  role: UserRole;
  user: ContextUser | null;
  token: string | null;
  login: (selectedRole: UserRole) => void;
  loginWithAuth: (user: ContextUser, token: string) => void;
  logout: () => void;
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  activityLogs: ActivityLog[];
  logActivity: (action: string) => void;
  predefinedLocations: Location[];
  drivers: Driver[];
  vehicles: Vehicle[];
  updateDriverStatus: (id: string, status: Driver['status']) => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('logistics_auth') === 'true';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('logistics_role') as UserRole) || null;
  });
  const [user, setUser] = useState<ContextUser | null>(() => {
    const saved = localStorage.getItem('logistics_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('logistics_token') || null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('logistics_products_in_v1');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'PRD-001', name: 'Industrial Drones', description: 'Heavy lift transport drone', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=300&q=80', quantity: 45, location: 'DL', status: 'In Stock' },
      { id: 'PRD-002', name: 'Freight Containers', description: 'Standard 40ft container', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7450900?auto=format&fit=crop&w=300&q=80', quantity: 12, location: 'MU', status: 'In Stock' },
      { id: 'PRD-003', name: 'Electronic Parts', description: 'Circuit boards and microchips', image: 'https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?auto=format&fit=crop&w=300&q=80', quantity: 1500, location: 'BL', status: 'In Stock' },
      { id: 'PRD-004', name: 'Medical Supplies', description: 'Emergency surgical kits', image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=300&q=80', quantity: 80, location: 'CH', status: 'Packed' },
      { id: 'PRD-005', name: 'Fresh Produce', description: 'Organic farm vegetables', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80', quantity: 500, location: 'KO', status: 'In Stock' },
      { id: 'PRD-006', name: 'Textile Materials', description: 'Premium cotton and silk', image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=300&q=80', quantity: 300, location: 'MU', status: 'Dispatched' },
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('logistics_logs');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('logistics_drivers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'DRV-001', name: 'James Wilson', status: 'Available', vehicleId: 'VHC-001', rating: 4.8 },
      { id: 'DRV-002', name: 'Sarah Connor', status: 'On Route', vehicleId: 'VHC-002', rating: 4.9 },
      { id: 'DRV-003', name: 'Mike Ross', status: 'Off Duty', rating: 4.5 },
    ];
  });

  const [vehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('logistics_vehicles');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'VHC-001', type: 'Heavy Truck', licensePlate: 'LY-1029', capacity: '15 Tonnes', status: 'Active' },
      { id: 'VHC-002', type: 'Delivery Van', licensePlate: 'LY-4050', capacity: '3 Tonnes', status: 'Active' },
      { id: 'VHC-003', type: 'Transport Drone', licensePlate: 'DRN-X1', capacity: '50 Kg', status: 'Maintenance' },
    ];
  });

  // Predefined locations to map to real lat/lng for Map/Backend mapping
  const predefinedLocations: Location[] = [
    { id: 'DL', name: 'Delhi NCR Hub', lat: 28.7041, lng: 77.1025 },
    { id: 'MU', name: 'Mumbai Port', lat: 19.0760, lng: 72.8777 },
    { id: 'BL', name: 'Bangalore Tech Park', lat: 12.9716, lng: 77.5946 },
    { id: 'CH', name: 'Chennai Base', lat: 13.0827, lng: 80.2707 },
    { id: 'KO', name: 'Kolkata Distribution', lat: 22.5726, lng: 88.3639 }
  ];

  useEffect(() => {
    localStorage.setItem('logistics_auth', isAuthenticated.toString());
    if (role) {
      localStorage.setItem('logistics_role', role);
    } else {
      localStorage.removeItem('logistics_role');
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    localStorage.setItem('logistics_products_in_v1', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('logistics_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('logistics_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('logistics_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    localStorage.setItem('logistics_auth', 'true');
    localStorage.setItem('logistics_role', selectedRole || '');
  };

  const loginWithAuth = (authUser: ContextUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    setRole(authUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('logistics_auth', 'true');
    localStorage.setItem('logistics_role', authUser.role);
    localStorage.setItem('logistics_user', JSON.stringify(authUser));
    localStorage.setItem('logistics_token', authToken);
    logActivity(`Session started: ${authUser.username} (${authUser.role})`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('logistics_auth');
    localStorage.removeItem('logistics_role');
    localStorage.removeItem('logistics_user');
    localStorage.removeItem('logistics_token');
  };

  const logActivity = (action: string) => {
    setActivityLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), action, timestamp: new Date().toISOString() }, ...prev]);
  };

  const addProduct = (p: Product) => {
    setProducts(prev => [...prev, p]);
    logActivity(`Added new product: ${p.name}`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logActivity(`Updated product: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const p = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if(p) logActivity(`Deleted product: ${p.name}`);
  };

  const updateDriverStatus = (id: string, status: Driver['status']) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    logActivity(`Updated driver ${id} status to ${status}`);
  };

  return (
    <LogisticsContext.Provider value={{
      isAuthenticated,
      role,
      user,
      token,
      login,
      loginWithAuth,
      logout,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      drivers,
      updateDriverStatus,
      vehicles,
      predefinedLocations,
      activityLogs,
      logActivity
    }}>
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) throw new Error('useLogistics must be used within a LogisticsProvider');
  return context;
};
