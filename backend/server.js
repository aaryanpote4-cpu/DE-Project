require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const { initMySQL } = require('./db/mysql');
const { initMongo } = require('./db/mongo');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', routes);

// Serve frontend production build directly from Node.js (Unified Full-Stack App)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Serve static directory fallback
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use('/static', express.static(frontendDir));

// For SPA routing, redirect non-API GET/HEAD routes to compiled frontend index.html
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  // If dist is not yet built, return a friendly informative status page instead of a blank white screen
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Delivery & Logistics Optimizer - Setup</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 600px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
        h1 { color: #38bdf8; font-size: 24px; margin-top: 0; }
        p { color: #94a3b8; line-height: 1.6; }
        .code-box { background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; text-align: left; font-family: monospace; color: #34d399; margin: 20px 0; font-size: 14px; }
        a.btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Backend API Running</h1>
        <p>The Node.js & Express API is active. To view the React Frontend, either start the Vite dev server or build the frontend:</p>
        <div class="code-box">
          # Option 1: Start Vite Live Dev Server<br>
          cd frontend && npm run dev<br><br>
          # Option 2: Build Production Bundle<br>
          cd frontend && npm run build
        </div>
        <p>You can also access the API health check:</p>
        <a class="btn" href="/api/health" target="_blank">View /api/health</a>
      </div>
    </body>
    </html>
  `);
});

async function startServer() {
  console.log('====================================================');
  console.log(' Delivery & Logistics Optimizer: Unified Platform');
  console.log(' Full-Stack: React Frontend + Node.js API + MySQL & MongoDB');
  console.log('====================================================');

  // Initialize databases (non-blocking with resilient fallback)
  await initMySQL();
  await initMongo();

  // Listen on all network interfaces (dual-stack IPv4 & IPv6) so localhost, 127.0.0.1, and ::1 all work
  app.listen(port, () => {
    console.log(`\n🚀 Unified Application running at:`);
    console.log(`👉 http://localhost:${port}`);
    console.log(`👉 http://127.0.0.1:${port}`);
    console.log(`📡 API Endpoints available at http://localhost:${port}/api`);
    console.log(`🏥 Health check at http://localhost:${port}/api/health\n`);
  });
}

startServer();
