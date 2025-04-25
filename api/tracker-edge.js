const { createClient } = require('@vercel/edge-config');
const config = createClient(process.env.EDGE_CONFIG);
const LOG_KEY = 'email_tracker_logs';
const MAX_LOGS = 1000;

async function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  try {
    // Get existing logs
    let logs = await config.get(LOG_KEY) || [];
    if (!Array.isArray(logs)) logs = [];
    
    // Add new log at the beginning
    logs.unshift(logMessage);
    
    // Keep only the most recent logs
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(0, MAX_LOGS);
    }
    
    // Store updated logs
    await config.set(LOG_KEY, logs);
    console.log(logMessage); // Console log for debugging
  } catch (error) {
    console.error('Error storing log:', error);
  }
}

// Main tracking endpoint
module.exports = async (req, res) => {
  if (req.query.getLogs) {
    try {
      const logs = await config.get(LOG_KEY) || [];
      return res.json({ logs: logs.join('\n') });
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }

  const userId = req.query.id || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId} | User-Agent: ${userAgent}`;
  
  await appendLog(logMessage);

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