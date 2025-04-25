// tracker.js - Place this in your server directory
let logs = [];  // In-memory storage for logs
const MAX_LOGS = 1000;  // Limit the number of stored logs

// Log function
function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  logs.unshift(logMessage);  // Add to beginning of array
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(0, MAX_LOGS);  // Keep only the most recent logs
  }
  console.log(logMessage);  // Still log to console for debugging
}

// Main tracking endpoint
module.exports = (req, res) => {
  if (req.query.getLogs) {
    // Return logs if getLogs parameter is present
    return res.json({ logs: logs.join('\n') });
  }

  const userId = req.query.id || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId} | User-Agent: ${userAgent}`;
  
  appendLog(logMessage);

  // Generate a 1x1 transparent pixel
  const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.end(transparentPixel);
};