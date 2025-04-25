const { put, list, del } = require('@vercel/blob');
const LOG_PREFIX = 'email-logs';
const MAX_LOGS = 1000;

async function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  try {
    // Create a unique filename for this log
    const filename = `${LOG_PREFIX}/${timestamp}-${Math.random().toString(36).substring(7)}.txt`;
    
    // Store the log entry as a blob
    await put(filename, logMessage, {
      access: 'public',
      addRandomSuffix: false
    });

    // List and cleanup old logs if needed
    const { blobs } = await list({ prefix: LOG_PREFIX });
    if (blobs.length > MAX_LOGS) {
      // Sort by creation time and delete oldest entries
      const sortedBlobs = blobs.sort((a, b) => b.uploadedAt - a.uploadedAt);
      const toDelete = sortedBlobs.slice(MAX_LOGS);
      await Promise.all(toDelete.map(blob => del(blob.url)));
    }

    console.log(logMessage); // Console log for debugging
  } catch (error) {
    console.error('Error storing log:', error);
  }
}

// Main tracking endpoint
module.exports = async (req, res) => {
  if (req.query.getLogs) {
    try {
      const { blobs } = await list({ prefix: LOG_PREFIX });
      const sortedBlobs = blobs.sort((a, b) => b.uploadedAt - a.uploadedAt);
      const logPromises = sortedBlobs.map(async blob => {
        const response = await fetch(blob.url);
        return response.text();
      });
      const logs = await Promise.all(logPromises);
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