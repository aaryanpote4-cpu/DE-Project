import { Routes, Route, Navigate } from 'react-router-dom';
import { useLogistics } from './contexts/LogisticsContext';
import SplashView from './components/views/SplashView';
import AuthView from './components/views/AuthView';
import AppLayout from './components/layout/AppLayout';
import DashboardView from './components/views/DashboardView';
import WarehouseMapView from './components/views/WarehouseMapView';
import InventoryView from './components/views/InventoryView';
import OrderTrackingView from './components/views/OrderTrackingView';
import DatabaseLiveView from './components/views/DatabaseLiveView';
import ProfileView from './components/views/ProfileView';

export default function App() {
  const { isAuthenticated } = useLogistics();

  return (
    <Routes>
      <Route path="/" element={<SplashView />} />
      <Route path="/auth" element={!isAuthenticated ? <AuthView /> : <Navigate to="/dashboard" />} />
      
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/auth" />}>
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/map" element={<WarehouseMapView />} />
        <Route path="/warehouses" element={<WarehouseMapView />} />
        <Route path="/inventory" element={<InventoryView />} />
        <Route path="/orders" element={<OrderTrackingView />} />
        <Route path="/database-view" element={<DatabaseLiveView />} />
        <Route path="/admin" element={<DatabaseLiveView />} />
        <Route path="/profile" element={<ProfileView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
