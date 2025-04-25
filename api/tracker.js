const path = require('path');
const fs = require('fs');

// Use a more reliable way to determine the base directory
const baseDir = process.cwd();
const logFilePath = path.join(baseDir, 'log.txt');

function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

module.exports = (req, res) => {
  const userId = req.query.id || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId}`;
  console.log(logMessage);
  appendLog(logMessage);

  // Try multiple possible locations for the pixel image
  const possiblePaths = [
    path.join(baseDir, 'pixel.png'),
    path.join(baseDir, 'public', 'pixel.png'),
    path.join(__dirname, 'pixel.png'),
    path.join(__dirname, '../pixel.png')
  ];
  
  // Find the first path that exists
  let imagePath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      imagePath = testPath;
      break;
    }
  }

  if (!imagePath) {
    // If no pixel image is found, generate a 1x1 transparent PNG on the fly
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.end(transparentPixel);
    
    appendLog('[INFO] Used fallback transparent pixel');
    return;
  }

  // Log success
  appendLog(`[SUCCESS] Serving pixel from: ${imagePath}`);
  
  // Serve the found image
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  fs.createReadStream(imagePath).pipe(res);
};