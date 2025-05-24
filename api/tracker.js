const path = require('path');
const fs = require('fs');
const { kv } = require('@vercel/kv');

const LOG_KEY = 'email_tracker_logs';
const MAX_LOGS = 1000;

// async function saveLogToVercel(message) {
//   const timestamp = new Date().toISOString();
//   const logMessage = `[${timestamp}] ${message}`;

//   try {
//     let logs = await kv.get(LOG_KEY) || [];
//     logs.unshift(logMessage);

//     if (logs.length > MAX_LOGS) {
//       logs = logs.slice(0, MAX_LOGS);
//     }

//     await kv.set(LOG_KEY, logs);
//   } catch (error) {
//     console.error('Error saving log to Vercel KV:', error);
//   }
// }

module.exports = async (req, res) => {
  const userId = req.query.id || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId}`;
  console.log(logMessage);
  // await saveLogToVercel(logMessage);

  // Get the absolute path of pixel.png
  const imagePath = path.resolve(__dirname, '../pixel.png');

  if (!fs.existsSync(imagePath)) {
    const errorMessage = `[ERROR] Image not found at: ${imagePath}`;
    console.error(errorMessage);
    // await saveLogToVercel(errorMessage);
    res.status(404).send('Image not found');
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store'); // Prevent caching of the pixel
  fs.createReadStream(imagePath).pipe(res);
};