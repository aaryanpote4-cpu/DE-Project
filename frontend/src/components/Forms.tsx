import React, { useState } from 'react';
import { addLocation, addEdge, addOrder, type Location } from '../api';
import { MapPin, Route, PackagePlus } from 'lucide-react';

interface FormsProps {
  locations: Location[];
  onUpdate: () => void;
}

const Forms: React.FC<FormsProps> = ({ locations, onUpdate }) => {
  const [locName, setLocName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [srcId, setSrcId] = useState('');
  const [dstId, setDstId] = useState('');
  const [distance, setDistance] = useState('');

  const [orderSrc, setOrderSrc] = useState('');
  const [orderDst, setOrderDst] = useState('');

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !lat || !lng) return;
    try {
      await addLocation({ name: locName, lat: parseFloat(lat), lng: parseFloat(lng) });
      setLocName(''); setLat(''); setLng('');
      onUpdate();
    } catch (err) { console.error(err); }
  };

  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcId || !dstId || !distance) return;
    try {
      await addEdge({ source: srcId, destination: dstId, distance: parseFloat(distance) });
      setSrcId(''); setDstId(''); setDistance('');
      onUpdate();
    } catch (err) { console.error(err); }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSrc || !orderDst) return;
    try {
      await addOrder({ source: orderSrc, destination: orderDst });
      setOrderSrc(''); setOrderDst('');
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-4">
          <MapPin className="w-5 h-5 text-indigo-500" /> Add Location
        </h3>
        <form onSubmit={handleAddLocation} className="flex flex-col gap-3">
          <input className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Location Name" value={locName} onChange={e => setLocName(e.target.value)} required />
          <div className="flex gap-2">
            <input type="number" step="any" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} required />
            <input type="number" step="any" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} required />
          </div>
          <button className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium">Add Location</button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-4">
          <Route className="w-5 h-5 text-emerald-500" /> Add Route (Edge)
        </h3>
        <form onSubmit={handleAddEdge} className="flex flex-col gap-3">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" value={srcId} onChange={e => setSrcId(e.target.value)} required>
            <option value="">Select Source</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" value={dstId} onChange={e => setDstId(e.target.value)} required>
            <option value="">Select Destination</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="number" step="any" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Distance (Weight)" value={distance} onChange={e => setDistance(e.target.value)} required />
          <button className="bg-emerald-600 text-slate-900 py-2 rounded-md hover:bg-emerald-700 transition-colors font-medium">Add Edge</button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-4">
          <PackagePlus className="w-5 h-5 text-amber-500" /> Create Order
        </h3>
        <form onSubmit={handleAddOrder} className="flex flex-col gap-3">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" value={orderSrc} onChange={e => setOrderSrc(e.target.value)} required>
            <option value="">Select Source</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" value={orderDst} onChange={e => setOrderDst(e.target.value)} required>
            <option value="">Select Destination</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="bg-amber-500 text-slate-900 py-2 rounded-md hover:bg-amber-600 transition-colors font-medium">Add Order to Queue</button>
        </form>
      </div>
    </div>
  );
};

export default Forms;
