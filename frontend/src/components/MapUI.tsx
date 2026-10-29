import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Search, Filter, Warehouse as WarehouseIcon, Package, X, Phone, Plus, Trash2, CheckCircle } from 'lucide-react';
import { 
  getWarehouses, 
  getWarehouseById,
  getWarehouseInventory, 
  addWarehouseInventoryItem,
  deleteWarehouseInventoryItem,
  type Warehouse, 
  type WarehouseInventoryItem, 
  type Location, 
  type Edge 
} from '../api';

// Native Leaflet default marker icons fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Animated truck icon for live route tracking
const truckIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); transform: scaleX(-1);">🚛</div>`,
  className: 'truck-marker-moving',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Map controller to enforce India bounds, responsive invalidation, and programmatic flyTo
function MapController({ 
  selectedWarehouse,
  filteredWarehouses,
  onMapReady 
}: { 
  selectedWarehouse: Warehouse | null;
  filteredWarehouses: Warehouse[];
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);

    // Call invalidateSize after container mounts and after tab switches
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, onMapReady]);

  // Fit bounds when warehouses are loaded or search filter changes
  useEffect(() => {
    if (filteredWarehouses.length > 0 && !selectedWarehouse) {
      const validCoords = filteredWarehouses
        .filter(w => !isNaN(w.lat) && !isNaN(w.lng))
        .map(w => [w.lat, w.lng] as [number, number]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
      }
    }
  }, [filteredWarehouses, selectedWarehouse, map]);

  // Smoothly fly to selected warehouse
  useEffect(() => {
    if (selectedWarehouse && !isNaN(selectedWarehouse.lat) && !isNaN(selectedWarehouse.lng)) {
      map.flyTo([selectedWarehouse.lat, selectedWarehouse.lng], 8, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedWarehouse, map]);

  return null;
}

// Marker Cluster component to group nearby warehouses
function WarehouseClusterLayer({
  warehouses,
  selectedWarehouse,
  onSelectWarehouse
}: {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  onSelectWarehouse: (w: Warehouse) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Initialize marker cluster group with custom modern styling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
            border: 2px solid #ffffff;
          ">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [36, 36]
        });
      }
    });

    warehouses.forEach(w => {
      if (isNaN(w.lat) || isNaN(w.lng)) return;

      const isSelected = selectedWarehouse?.id === w.id;
      const isFull = w.status === 'full' || w.utilization >= 90;
      const isNearFull = w.status === 'near_full' || (w.utilization >= 70 && !isFull);
      const color = isFull ? '#ef4444' : isNearFull ? '#f59e0b' : '#10b981';
      const bg = isFull ? '#fef2f2' : isNearFull ? '#fffbeb' : '#ecfdf5';

      const icon = L.divIcon({
        className: 'custom-warehouse-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            background: ${bg};
            border: 2.5px solid ${color};
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="font-size: ${isSelected ? '18px' : '15px'}; line-height: 1;">🏬</span>
            <span style="
              position: absolute;
              bottom: -20px;
              white-space: nowrap;
              background: rgba(15, 23, 42, 0.9);
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 1px 6px;
              border-radius: 4px;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">${w.code || w.city}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([w.lat, w.lng], { icon });

      // Interactive popup
      const statusLabel = isFull ? 'Full (>90%)' : isNearFull ? 'Near Full (70-90%)' : 'Available (<70%)';
      const statusBadgeColor = isFull ? '#dc2626' : isNearFull ? '#d97706' : '#16a34a';

      const popupHtml = `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase;">${w.code}</span>
            <span style="font-size: 10px; font-weight: 700; color: #ffffff; background: ${statusBadgeColor}; padding: 2px 6px; border-radius: 9999px;">
              ${statusLabel}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${w.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">📍 ${w.city}, ${w.state}</p>
          <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">
              <span>Capacity Utilized</span>
              <span>${w.utilization}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
              <div style="width: ${w.utilization}%; height: 100%; background: ${color}; border-radius: 9999px;"></div>
            </div>
          </div>
          <button id="btn-wh-details-${w.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
          ">View Details & Inventory ➔</button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-wh-details-${w.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectWarehouse(w);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectWarehouse(w);
      });

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, warehouses, selectedWarehouse, onSelectWarehouse]);

  return null;
}

interface MapUIProps {
  locations?: Location[];
  edges?: Edge[];
  currentRoute?: { distance: number; path: string[] } | null;
  onWarehouseSelect?: (warehouse: Warehouse) => void;
  heightClass?: string;
}

export default function MapUI({ 
  edges = [], 
  currentRoute = null,
  onWarehouseSelect,
  heightClass = 'h-[620px]'
}: MapUIProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'near_full' | 'full'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Warehouse Inventory Side Panel state
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  // Add Item to Warehouse Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newSKUName, setNewSKUName] = useState<string>('');
  const [newSKUCode, setNewSKUCode] = useState<string>('');
  const [newSKUCategory, setNewSKUCategory] = useState<string>('Electronics');
  const [newSKUQty, setNewSKUQty] = useState<number>(100);
  const [newSKUPrice, setNewSKUPrice] = useState<number>(2500);
  const [isSavingSKU, setIsSavingSKU] = useState<boolean>(false);
  const [skuFeedback, setSkuFeedback] = useState<string>('');

  // Detailed road route animation
  const [detailedRoute, setDetailedRoute] = useState<[number, number][]>([]);
  const [truckPos, setTruckPos] = useState<[number, number] | null>(null);
  const animInterval = useRef<any>(null);

  // Load all warehouses from database through /api/warehouses
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getWarehouses()
      .then(data => {
        if (!isMounted) return;
        // Validate coordinates and skip or log invalid rows
        const valid = data.filter(w => {
          const lat = parseFloat(w.lat as any);
          const lng = parseFloat(w.lng as any);
          const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          if (!isValid) console.warn(`Skipping invalid warehouse coordinate: ${w.name}`);
          return isValid;
        });
        setWarehouses(valid);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load warehouses:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Filter warehouses live by search query and status
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        w.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.state.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warehouses, searchQuery, statusFilter]);

  // Handle warehouse selection & fetch inventory
  const handleSelectWarehouse = (w: Warehouse) => {
    setSelectedWarehouse(w);
    setIsPanelOpen(true);
    setInventoryLoading(true);

    if (onWarehouseSelect) {
      onWarehouseSelect(w);
    }

    getWarehouseInventory(w.id)
      .then(items => {
        setInventory(items);
        setInventoryLoading(false);
      })
      .catch(err => {
        console.error('Error fetching inventory:', err);
        setInventory([]);
        setInventoryLoading(false);
      });
  };

  // Add Item to Warehouse in Database
  const handleAddWarehouseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse || !newSKUName.trim()) return;

    setIsSavingSKU(true);
    setSkuFeedback('');

    try {
      const added = await addWarehouseInventoryItem(selectedWarehouse.id, {
        name: newSKUName.trim(),
        sku: newSKUCode.trim() || undefined,
        category: newSKUCategory,
        quantity: Number(newSKUQty) || 1,
        unit_price: Number(newSKUPrice) || 0,
        status: 'In Stock'
      });

      // Immediately display in current warehouse inventory list
      setInventory(prev => [added, ...prev]);

      // Recalculate warehouse space usage live
      const addedSpace = (Number(newSKUQty) || 1) * 10;
      const newUsed = Math.min(selectedWarehouse.total_capacity_sqft, (selectedWarehouse.used_capacity_sqft || 0) + addedSpace);
      const newUtil = Math.min(100, Math.round((newUsed / selectedWarehouse.total_capacity_sqft) * 100));
      const newStatus = newUtil >= 90 ? 'full' : newUtil >= 70 ? 'near_full' : 'available';

      const updatedWarehouse: Warehouse = {
        ...selectedWarehouse,
        used_capacity_sqft: newUsed,
        utilization: newUtil,
        status: newStatus
      };

      setSelectedWarehouse(updatedWarehouse);
      setWarehouses(prev => prev.map(w => w.id === updatedWarehouse.id ? updatedWarehouse : w));

      setSkuFeedback(`Item "${added.name}" saved to database!`);
      setNewSKUName('');
      setNewSKUCode('');
      setTimeout(() => {
        setShowAddForm(false);
        setSkuFeedback('');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to database');
    } finally {
      setIsSavingSKU(false);
    }
  };

  // Delete Item from Warehouse in Database
  const handleDeleteWarehouseItem = async (itemId: number) => {
    if (!selectedWarehouse) return;
    if (!window.confirm('Delete this item from warehouse inventory in the database?')) return;

    try {
      await deleteWarehouseInventoryItem(itemId);
      setInventory(prev => prev.filter(i => i.id !== itemId));

      // Refresh warehouse capacity from database
      const refreshed = await getWarehouseById(selectedWarehouse.id);
      if (refreshed) {
        setSelectedWarehouse(refreshed);
        setWarehouses(prev => prev.map(w => w.id === refreshed.id ? refreshed : w));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete item from database');
    }
  };

  // Dijkstra route truck animation
  useEffect(() => {
    if (animInterval.current) clearInterval(animInterval.current);

    if (currentRoute && currentRoute.path.length > 1) {
      const whMap = new Map<string | number, Warehouse>();
      warehouses.forEach(w => {
        whMap.set(w.id, w);
        whMap.set(w.code, w);
      });

      const routeWarehouses = currentRoute.path
        .map(id => whMap.get(id))
        .filter(Boolean) as Warehouse[];

      if (routeWarehouses.length > 1) {
        const coordsStr = routeWarehouses.map(w => `${w.lng},${w.lat}`).join(';');
        fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`)
          .then(res => res.json())
          .then(data => {
            if (data?.routes?.[0]?.geometry?.coordinates) {
              const detailed: [number, number][] = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
              setDetailedRoute(detailed);
              setTruckPos(detailed[0]);

              let step = 0;
              animInterval.current = setInterval(() => {
                step = (step + 1) % detailed.length;
                setTruckPos(detailed[step]);
              }, 50);
            }
          })
          .catch(() => {
            const straight: [number, number][] = routeWarehouses.map(w => [w.lat, w.lng]);
            setDetailedRoute(straight);
            setTruckPos(straight[0]);
          });
      }
    } else {
      setDetailedRoute([]);
      setTruckPos(null);
    }

    return () => {
      if (animInterval.current) clearInterval(animInterval.current);
    };
  }, [currentRoute, warehouses]);

  // Network connection lines between nodes
  const edgeLines = useMemo(() => {
    const whMap = new Map<string | number, Warehouse>();
    warehouses.forEach(w => whMap.set(w.id, w));

    return edges.map((e, idx) => {
      const src = whMap.get(e.source as any);
      const dst = whMap.get(e.destination as any);
      if (!src || !dst) return null;
      return (
        <Polyline 
          key={`edge-${idx}`} 
          positions={[[src.lat, src.lng], [dst.lat, dst.lng]]} 
          color="#94a3b8" 
          weight={2} 
          opacity={0.4} 
          dashArray="4, 8" 
        />
      );
    });
  }, [edges, warehouses]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-50 flex flex-col`}>
      {/* Search & Filter Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pointer-events-none">
        {/* Search Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-slate-200/80 w-full md:w-80">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, state, or warehouse..."
            className="w-full text-xs md:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({warehouses.length})
          </button>
          <button 
            onClick={() => setStatusFilter('available')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'available' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available
          </button>
          <button 
            onClick={() => setStatusFilter('near_full')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'near_full' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Near Full
          </button>
          <button 
            onClick={() => setStatusFilter('full')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'full' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Full
          </button>
        </div>
      </div>

      {/* Main Leaflet Map - Centered strictly on India with OpenStreetMap tiles */}
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        minZoom={4}
        maxBounds={[[6.0, 67.0], [37.5, 98.0]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="w-full h-full z-0 font-sans"
        style={{ minHeight: '100%', width: '100%' }}
      >
        <MapController 
          selectedWarehouse={selectedWarehouse} 
          filteredWarehouses={filteredWarehouses}
          onMapReady={() => {}} 
        />

        {/* OpenStreetMap TileLayer with strict Attribution - NO third-party API keys */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
        />

        {/* Inter-hub highway transit edges */}
        {edgeLines}

        {/* Active Dijkstra Shortest Path */}
        {detailedRoute.length > 0 && (
          <Polyline positions={detailedRoute} color="#2563eb" weight={5} opacity={0.9} />
        )}

        {/* Live Truck on Route */}
        {truckPos && (
          <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000} />
        )}

        {/* Clustered Warehouse Markers */}
        <WarehouseClusterLayer 
          warehouses={filteredWarehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={handleSelectWarehouse}
        />
      </MapContainer>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700">Loading Indian Warehouse Network...</p>
        </div>
      )}

      {/* Warehouse Detail & Inventory Slide-Out Side Panel */}
      {isPanelOpen && selectedWarehouse && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-[1500] border-l border-slate-200 flex flex-col animate-slide-left transition-all">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded">
                  {selectedWarehouse.code}
                </span>
                <h3 className="text-lg font-black mt-1.5 leading-snug">{selectedWarehouse.name}</h3>
                <p className="text-xs text-slate-300 mt-1">📍 {selectedWarehouse.city}, {selectedWarehouse.state}</p>
              </div>
              <button 
                onClick={() => setIsPanelOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Utilisation Bar */}
            <div className="mt-4 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-300">Space Utilisation</span>
                <span className={
                  selectedWarehouse.utilization >= 90 ? 'text-rose-400' :
                  selectedWarehouse.utilization >= 70 ? 'text-amber-400' : 'text-emerald-400'
                }>{selectedWarehouse.utilization}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedWarehouse.utilization >= 90 ? 'bg-rose-500' :
                    selectedWarehouse.utilization >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedWarehouse.utilization}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                <span>Used: {selectedWarehouse.used_capacity_sqft?.toLocaleString()} sqft</span>
                <span>Total: {selectedWarehouse.total_capacity_sqft?.toLocaleString()} sqft</span>
              </div>
            </div>

            {selectedWarehouse.manager_contact && (
              <div className="flex items-center gap-2 text-xs text-blue-200 mt-3 font-medium">
                <Phone size={13} className="text-blue-400" /> Contact: {selectedWarehouse.manager_contact}
              </div>
            )}
          </div>

          {/* Stored Inventory List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Package size={14} className="text-blue-600" /> Stored Inventory ({inventory.length} SKUs)
              </h4>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer"
              >
                <Plus size={13} />
                {showAddForm ? 'Cancel' : 'Add Item'}
              </button>
            </div>

            {/* Collapsible Add Item Form to Database */}
            {showAddForm && (
              <form onSubmit={handleAddWarehouseItem} className="p-4 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-3 shadow-lg animate-fade-in mb-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Plus size={13} /> Add Item to {selectedWarehouse.name}
                  </h5>
                  <span className="text-[10px] text-slate-400">Syncs to Database</span>
                </div>

                {skuFeedback && (
                  <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle size={14} /> {skuFeedback}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Product Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Industrial Automation Motors"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    value={newSKUName}
                    onChange={e => setNewSKUName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Category</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      value={newSKUCategory}
                      onChange={e => setNewSKUCategory(e.target.value)}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Medical">Medical</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Robotics">Robotics</option>
                      <option value="Cold Chain">Cold Chain</option>
                      <option value="Chemicals">Chemicals</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Custom SKU (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. WH-EL-99"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      value={newSKUCode}
                      onChange={e => setNewSKUCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Quantity *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      value={newSKUQty}
                      onChange={e => setNewSKUQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Unit Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      value={newSKUPrice}
                      onChange={e => setNewSKUPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSKU}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isSavingSKU ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Save to Warehouse in Database
                    </>
                  )}
                </button>
              </form>
            )}

            {inventoryLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="p-3 bg-slate-100 rounded-xl animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 p-6">
                <WarehouseIcon size={36} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No Inventory Items</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Item" above to add products to this warehouse.</p>
              </div>
            ) : (
              inventory.map(item => (
                <div key={item.id} className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200/70 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wide">{item.sku}</span>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug mt-0.5">{item.name}</h5>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeleteWarehouseItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Delete from database"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/50 text-xs">
                    <div className="font-semibold text-slate-600">
                      Quantity: <span className="font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
                    </div>
                    <div className="font-bold text-blue-600">
                      ₹{item.unit_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
