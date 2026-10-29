/**
 * ui.js - Handles UI interactions, SPA routing, and mocked modules (Inventory/Auth)
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Splash Screen ---
    const splash = document.getElementById('splash-screen');
    setTimeout(() => {
        splash.classList.add('splash-fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 800); // Wait for CSS transition
    }, 2500);

    // --- 2. Single Page Apps Navigation ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all btns and views
            navBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));
            
            // Add active to clicked btn and target view
            const targetId = e.currentTarget.getAttribute('data-target');
            e.currentTarget.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Force Leaflet map resize if we navigated back to dashboard
            if(targetId === 'dashboard-view' && window.map) {
                setTimeout(() => window.map.invalidateSize(), 50);
            }
        });
    });

    // --- 3. Refactored "Add Location" Logic ---
    // Remove manual Lat/Lng typing. We map predefined values to the hidden inputs.
    const predefLocations = {
        "NY":  { name: "New York Hub", lat: 40.7128, lng: -74.0060 },
        "LA":  { name: "LA Distribution", lat: 34.0522, lng: -118.2437 },
        "CH":  { name: "Chicago Port", lat: 41.8781, lng: -87.6298 },
        "HU":  { name: "Houston Center", lat: 29.7604, lng: -95.3698 },
        "MIA": { name: "Miami Hub", lat: 25.7617, lng: -80.1918 },
        "SF":  { name: "SF Logistics", lat: 37.7749, lng: -122.4194 },
        "SEA": { name: "Seattle Port", lat: 47.6062, lng: -122.3321 },
        "DEN": { name: "Denver Station", lat: 39.7392, lng: -104.9903 }
    };

    const locSelect = document.getElementById('predefined-loc-select');
    const locNameField = document.getElementById('loc-name');
    const locLatField = document.getElementById('loc-lat');
    const locLngField = document.getElementById('loc-lng');

    if(locSelect) {
        locSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if(predefLocations[key]) {
                const data = predefLocations[key];
                locNameField.value = data.name;
                locLatField.value = data.lat;
                locLngField.value = data.lng;
            } else {
                locNameField.value = '';
                locLatField.value = '';
                locLngField.value = '';
            }
        });
    }

    // --- 4. Inventory Management Mock ---
    const mockInventory = [
        { id: "SKU-9901", name: "Industrial Drones v2", stock: 145, loc: "New York Hub", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=300&q=80" },
        { id: "SKU-9902", name: "Freight Containers", stock: 32, loc: "Miami Hub", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7450900?auto=format&fit=crop&w=300&q=80" },
        { id: "SKU-9903", name: "Handling Forklifts", stock: 8, loc: "Chicago Port", image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=300&q=80" },
        { id: "SKU-9904", name: "Delivery Vans", stock: 120, loc: "SF Logistics", image: "https://images.unsplash.com/photo-1566866164250-b08e7dfec775?auto=format&fit=crop&w=300&q=80" },
        { id: "SKU-9905", name: "Pallet Jacks", stock: 54, loc: "LA Distribution", image: "https://plus.unsplash.com/premium_photo-1661962369651-698fba57530e?auto=format&fit=crop&w=300&q=80" },
        { id: "SKU-9906", name: "Cardboard Packaging", stock: 15300, loc: "Houston Center", image: "https://images.unsplash.com/photo-1605600659901-b939cde1deea?auto=format&fit=crop&w=300&q=80" }
    ];

    const inventoryGrid = document.getElementById('inventory-grid');
    const searchInput = document.getElementById('inv-search');

    function renderInventory(filterText = '') {
        if(!inventoryGrid) return;
        inventoryGrid.innerHTML = '';
        const lowerFilter = filterText.toLowerCase();

        mockInventory.forEach(item => {
            if(item.name.toLowerCase().includes(lowerFilter) || item.id.toLowerCase().includes(lowerFilter)) {
                
                // Color formatting for stock
                let stockColor = '#10b981'; // Green
                if(item.stock < 20) stockColor = '#ef4444'; // Red
                else if (item.stock < 60) stockColor = '#f59e0b'; // Yellow

                const card = document.createElement('div');
                card.className = 'inv-card';
                card.innerHTML = `
                    <div class="inv-img" style="background-image: url('${item.image}')"></div>
                    <div class="inv-content">
                        <h4>${item.name}</h4>
                        <p class="skuid">${item.id}</p>
                        <div class="inv-stats">
                            <span class="stock" style="color:${stockColor}">📦 ${item.stock} in stock</span>
                            <span class="loc">📍 ${item.loc}</span>
                        </div>
                    </div>
                `;
                inventoryGrid.appendChild(card);
            }
        });
    }

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderInventory(e.target.value);
        });
    }
    
    // Initial Render
    renderInventory();


    // --- 5. Update Profile Stats periodically (from window.state) ---
    // If state is managed in app.js, we can peek at it to make the profile look dynamic via an interval or event
    setInterval(() => {
        const statOrders = document.getElementById('stat-orders');
        const statNodes = document.getElementById('stat-nodes');
        
        // Ensure state exists since app.js might initialize it
        // Only update if defined to prevent errors
        if(typeof state !== 'undefined') {
            if(statOrders) statOrders.innerText = (state.queue && state.queue.length) || Object.keys(state.statuses).length || 0;
            if(statNodes) statNodes.innerText = state.locations ? state.locations.length : 0;
        }
    }, 2000);

    // --- 6. Auth Mock Navigation ---
    const authForm = document.getElementById('login-form');
    if(authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate Login Success, redirect to Dashboard
            navBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));
            document.querySelector('[data-target="dashboard-view"]').classList.add('active');
            document.getElementById('dashboard-view').classList.add('active');
            
            // Adjust Login btn text
            const authBtn = document.querySelector('.btn-auth');
            if(authBtn) authBtn.innerText = "System Logged In";
        });
    }

});
