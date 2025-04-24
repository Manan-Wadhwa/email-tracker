const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  const userId = req.query.id || 'unknown';
  console.log(`[OPENED EMAIL] User ID: ${userId}`);

  // Get the absolute path of pixel.png
  const imagePath = path.resolve(__dirname, '../pixel.png');

  if (!fs.existsSync(imagePath)) {
    console.error(`[ERROR] Image not found at: ${imagePath}`);
    res.status(404).send('Image not found');
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  fs.createReadStream(imagePath).pipe(res);
};