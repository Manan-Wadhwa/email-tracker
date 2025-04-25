// tracker.js - Place this in your server directory
const path = require('path');
const fs = require('fs');
const http = require('http');

// Create base directory where files will be stored
const baseDir = process.cwd();
const logFilePath = path.join(baseDir, 'log.txt');

// Generate a 1x1 transparent pixel
const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Log function
function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
    // Create the log file if it doesn't exist
    if (error.code === 'ENOENT') {
      try {
        fs.writeFileSync(logFilePath, logMessage, 'utf8');
        console.log(`Created new log file at ${logFilePath}`);
      } catch (writeError) {
        console.error(`Failed to create log file: ${writeError.message}`);
      }
    }
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Tracking pixel endpoint
  if (pathname === '/tracker') {
    const userId = url.searchParams.get('id') || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const logMessage = `[OPENED EMAIL] User ID: ${userId} | User-Agent: ${userAgent}`;
    
    console.log(logMessage);
    appendLog(logMessage);
    
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(transparentPixel);
    return;
  }
  
  // Logs endpoint
  if (pathname === '/logs') {
    // Simple authentication - replace with something more secure in production
    const authKey = url.searchParams.get('key');
    if (authKey !== 'admin-secret-key') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    
    try {
      if (fs.existsSync(logFilePath)) {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ logs: logData }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Log file not found', path: logFilePath }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Failed to read logs: ${error.message}` }));
    }
    return;
  }
  
  // Serve the HTML page
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(baseDir, 'tracker.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading HTML page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Tracking pixel URL: http://localhost:${PORT}/tracker?id=test`);
  console.log(`Logs URL: http://localhost:${PORT}/logs?key=admin-secret-key`);
});