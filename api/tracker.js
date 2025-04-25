const path = require('path');
const fs = require('fs');

const logFilePath = path.resolve(__dirname, '../log.txt');

function appendLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

module.exports = (req, res) => {
  const userId = req.query.id || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId}`;
  console.log(logMessage);
  appendLog(logMessage);

  // Get the absolute path of pixel.png
  const imagePath = path.resolve(__dirname, '../pixel.png');

  if (!fs.existsSync(imagePath)) {
    const errorMessage = `[ERROR] Image not found at: ${imagePath}`;
    console.error(errorMessage);
    appendLog(errorMessage);
    res.status(404).send('Image not found');
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store'); // Prevent caching of the pixel
  fs.createReadStream(imagePath).pipe(res);
};