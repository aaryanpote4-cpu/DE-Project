import { useState } from 'react';
import { useLogistics } from '../../contexts/LogisticsContext';
import { Car, Truck, Plus, CheckCircle, Clock, Wrench } from 'lucide-react';

export default function FleetView() {
  const { drivers, vehicles } = useLogistics();
  const [viewTab, setViewTab] = useState<'drivers' | 'vehicles'>('drivers');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fleet Management</h1>
          <p className="text-slate-500 mt-1">Monitor drivers and manage assignment vehicles</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-blue-500/20 flex items-center gap-2 transition">
          <Plus size={18} /> {viewTab === 'drivers' ? 'Add Driver' : 'Add Vehicle'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setViewTab('drivers')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors ${viewTab === 'drivers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Car size={18} /> Drivers
        </button>
        <button 
          onClick={() => setViewTab('vehicles')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors ${viewTab === 'vehicles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Truck size={18} /> Vehicles
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {viewTab === 'drivers' ? (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Driver Name</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Vehicle</th>
                <th className="px-6 py-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{driver.name}</td>
                  <td className="px-6 py-4">{driver.id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      driver.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                      driver.status === 'On Route' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {driver.status === 'Available' && <CheckCircle size={12} />}
                      {driver.status === 'On Route' && <Clock size={12} />}
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{driver.vehicleId || <span className="text-slate-400">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-orange-400 font-medium">{driver.rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Model Type</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{vehicle.licensePlate}</td>
                  <td className="px-6 py-4">{vehicle.id}</td>
                  <td className="px-6 py-4">{vehicle.type}</td>
                  <td className="px-6 py-4">{vehicle.capacity}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      vehicle.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {vehicle.status === 'Active' && <CheckCircle size={12} />}
                      {vehicle.status === 'Maintenance' && <Wrench size={12} />}
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
