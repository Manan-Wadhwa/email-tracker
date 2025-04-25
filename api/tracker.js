const path = require('path');
const fs = require('fs');

// Store logs in memory
const logArray = [];

// Main tracking endpoint
module.exports = (req, res) => {
  if (req.query.getLogs) {
    // Return logs if getLogs parameter is present
    return res.json(logArray);
  }

  const userId = req.query.id || 'unknown';
  const timestamp = new Date().toISOString();
  const logEntry = { userId, timestamp };
  
  // Add log to array
  logArray.push(logEntry);
  console.log(`[OPENED EMAIL] User ID: ${userId}`);

  // Get the absolute path of pixel.png
  const imagePath = path.resolve(__dirname, '../pixel.png');

  if (!fs.existsSync(imagePath)) {
    console.error(`[ERROR] Image not found at: ${imagePath}`);
    res.status(404).send('Image not found');
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store'); // Prevent caching of the pixel
  fs.createReadStream(imagePath).pipe(res);
};