// app.js
// Main Application State and API Calls

const API_URL = 'http://localhost:3000/api';

let state = {
    locations: [],
    edges: [],
    queue: [],
    statuses: {},
    currentRoute: null
};

// DOM Elements
const edgeSrc = document.getElementById('edge-src');
const edgeDst = document.getElementById('edge-dst');
const orderSrc = document.getElementById('order-src');
const orderDst = document.getElementById('order-dst');
const queueList = document.getElementById('queue-list');
const processBtn = document.getElementById('process-order-btn');

async function fetchData() {
    try {
        const [locRes, edgeRes, orderRes] = await Promise.all([
            fetch(`${API_URL}/locations`),
            fetch(`${API_URL}/edges`),
            fetch(`${API_URL}/orders`)
        ]);

        state.locations = await locRes.json();
        state.edges = await edgeRes.json();
        
        const ordersData = await orderRes.json();
        state.queue = ordersData.queue;
        state.statuses = ordersData.statuses;

        updateUI();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateDropdowns() {
    const optionsHtml = `<option value="">Select Location</option>` + 
        state.locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    
    // Only update if not currently focused to prevent UI glitching during typing
    if (document.activeElement !== edgeSrc) edgeSrc.innerHTML = optionsHtml;
    if (document.activeElement !== edgeDst) edgeDst.innerHTML = optionsHtml;
    if (document.activeElement !== orderSrc) orderSrc.innerHTML = optionsHtml;
    if (document.activeElement !== orderDst) orderDst.innerHTML = optionsHtml;
}

function updateQueueUI() {
    if (state.queue.length === 0) {
        queueList.innerHTML = `<p class="empty-text">Queue is empty</p>`;
        processBtn.disabled = true;
    } else {
        processBtn.disabled = false;
        queueList.innerHTML = state.queue.map((order, idx) => `
            <div class="queue-item">
                <span>#${idx + 1} - Order ${order.id}</span>
                <span style="color: #d97706; font-size: 0.75rem bg-color: #fef3c7; padding: 2px 6px; border-radius: 4px;">
                    ${state.statuses[order.id] || order.status}
                </span>
            </div>
        `).join('');
    }
}

function updateUI() {
    updateDropdowns();
    updateQueueUI();
    window.updateMap(state.locations, state.edges, state.currentRoute);
}

// Form Listeners
document.getElementById('add-location-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('loc-name').value;
    const lat = document.getElementById('loc-lat').value;
    const lng = document.getElementById('loc-lng').value;
    
    await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat: parseFloat(lat), lng: parseFloat(lng) })
    });
    
    e.target.reset();
    fetchData();
});

document.getElementById('add-edge-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const source = edgeSrc.value;
    const destination = edgeDst.value;
    const distance = document.getElementById('edge-distance').value;
    
    await fetch(`${API_URL}/edges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination, distance: parseFloat(distance) })
    });
    
    e.target.reset();
    fetchData();
});

document.getElementById('add-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const source = orderSrc.value;
    const destination = orderDst.value;
    
    await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination })
    });
    
    e.target.reset();
    fetchData();
});

processBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_URL}/process-order`, { method: 'POST' });
        const data = await res.json();
        
        if (data.error) {
            alert(data.error);
        } else {
            state.currentRoute = data.route;
            // Fetch newest statuses
            fetchData();
        }
    } catch (e) {
        alert("Error processing order.");
        console.error(e);
    }
});

// Init
window.initMap();
fetchData();
setInterval(fetchData, 5000);
