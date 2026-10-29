// map.js
// Handles all Leaflet map initialization and updates

let map;
let markersLayer;
let edgesLayer;
let routeLayer;
let locMap = new Map();

function initMap() {
    // Default center
    map = L.map('map').setView([37.7749, -122.4194], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    edgesLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
}

function updateMap(locations, edges, currentRoute) {
    if (!map) initMap();

    // Clear existing layers
    markersLayer.clearLayers();
    edgesLayer.clearLayers();
    routeLayer.clearLayers();
    locMap.clear();

    if (locations.length === 0) return;

    // Add locations and build map for fast lookup
    const latLngs = [];
    locations.forEach(loc => {
        locMap.set(loc.id, loc);
        latLngs.push([loc.lat, loc.lng]);

        const marker = L.marker([loc.lat, loc.lng]).addTo(markersLayer);
        marker.bindPopup(`<b>${loc.name}</b><br>Lat: ${loc.lat.toFixed(4)}<br>Lng: ${loc.lng.toFixed(4)}`);
    });

    // Fit bounds to locations
    if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Draw all edges as gray dashed lines
    edges.forEach(edge => {
        const src = locMap.get(edge.source);
        const dst = locMap.get(edge.destination);
        if (src && dst) {
            L.polyline([[src.lat, src.lng], [dst.lat, dst.lng]], {
                color: '#9ca3af',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
            }).addTo(edgesLayer);
        }
    });

    // Draw highlighted active route
    if (currentRoute && currentRoute.path && currentRoute.path.length > 1) {
        const routePositions = currentRoute.path.map(id => {
            const loc = locMap.get(id);
            return loc ? [loc.lat, loc.lng] : null;
        }).filter(pos => pos !== null);

        if (routePositions.length > 1) {
            L.polyline(routePositions, {
                color: '#3b82f6',
                weight: 5,
                opacity: 0.9
            }).addTo(routeLayer);
        }
    }
}

// Attach to window so app.js can use it
window.initMap = initMap;
window.updateMap = updateMap;
