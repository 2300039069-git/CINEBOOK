/**
 * ============================================================================
 * CineBook Scraped Movies API Server (Express.js)
 * ============================================================================
 * Serves cached BookMyShow scraped cinema listings with 0ms latency.
 * Includes automated on-demand scrape triggers, CORS headers, and scheduled updates.
 *
 * Endpoints:
 *   - GET  /api/movies/:city   -> Returns cached/scraped movie data for specified city
 *   - POST /api/scrape/:city   -> Triggers live on-demand scrape and refreshes cache
 *   - GET  /api/cities         -> Returns list of all available scraped cities
 *   - GET  /health             -> Health check
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { scrapeBMS } = require('./scrapers/bmsScraper');

const PORT = process.env.PORT || 5000;
const OUTPUT_DIR = path.join(__dirname, 'scrapers/output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lightweight native HTTP server with full Express-like routing & CORS
const server = http.createServer(async (req, res) => {
  // Set Universal CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Health Check Endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'CineBook Scraper API', timestamp: new Date().toISOString() }));
    return;
  }

  // 2. List Available Cities
  if (pathname === '/api/cities') {
    try {
      const files = fs.readdirSync(OUTPUT_DIR);
      const cities = files
        .filter(f => f.endsWith('_movies.json'))
        .map(f => f.replace('_movies.json', ''));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ cities, total: cities.length }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 3. Trigger Live Scrape on Demand: POST /api/scrape/:city
  if (pathname.startsWith('/api/scrape/') && req.method === 'POST') {
    const city = pathname.replace('/api/scrape/', '').toLowerCase().trim();
    if (!city) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'City name required' }));
      return;
    }

    try {
      console.log(`[API Server] On-demand scrape triggered for city: "${city}"`);
      const freshData = await scrapeBMS(city);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Successfully refreshed listings for ${city}`, data: freshData }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to scrape city', details: err.message }));
    }
    return;
  }

  // 4. Get Scraped Movies by City: GET /api/movies/:city
  if (pathname.startsWith('/api/movies/')) {
    const city = pathname.replace('/api/movies/', '').toLowerCase().trim();
    if (!city) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'City name parameter required' }));
      return;
    }

    const filePath = path.join(OUTPUT_DIR, `${city}_movies.json`);

    // If cached file exists, serve immediately with 0ms latency
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
      } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
      }
    }

    // If file doesn't exist yet, run on-the-fly scrape and return result
    try {
      console.log(`[API Server] No cache found for "${city}". Executing automatic on-the-fly scrape...`);
      const freshData = await scrapeBMS(city);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(freshData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Could not retrieve listings for ${city}`, details: err.message }));
    }
    return;
  }

  // Fallback 404 Route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', availableEndpoints: ['/api/movies/:city', '/api/cities', '/api/scrape/:city', '/health'] }));
});

server.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 CineBook Scraper API Server running on port ${PORT}`);
  console.log(`📡 GET  http://localhost:${PORT}/api/movies/:city`);
  console.log(`📡 GET  http://localhost:${PORT}/api/cities`);
  console.log(`📡 POST http://localhost:${PORT}/api/scrape/:city`);
  console.log(`========================================================\n`);
});

module.exports = server;
