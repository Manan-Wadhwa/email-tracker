// tracker.js - Place this in your server directory
const path = require('path');
const fs = require('fs');

// Create base directory where files will be stored
const baseDir = process.cwd();
const logFilePath = path.join(baseDir, 'log.txt');

// Log function
function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
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

// Main tracking endpoint
module.exports = (req, res) => {
  if (req.query.getLogs) {
    // Return logs if getLogs parameter is present
    try {
      if (fs.existsSync(logFilePath)) {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        return res.json({ logs: logData });
      } else {
        return res.json({ logs: '' });
      }
    } catch (error) {
      console.error('Error reading logs:', error);
      return res.status(500).json({ error: 'Failed to read logs' });
    }
  }

  const userId = req.query.id || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId} | User-Agent: ${userAgent}`;
  
  console.log(logMessage);
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