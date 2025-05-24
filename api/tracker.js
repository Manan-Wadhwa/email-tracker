const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function saveLogToSupabase(message) {
  const { data, error } = await supabase
    .from('email_logs')
    .insert([{ message }]);

  if (error) {
    console.error('Error saving log to Supabase:', error);
  } else {
    console.log('Log saved to Supabase:', data);
  }
}

module.exports = async (req, res) => {
  const userId = req.query.id || 'unknown';
  const logMessage = `[OPENED EMAIL] User ID: ${userId}`;
  console.log(logMessage);
  await saveLogToSupabase(logMessage);

  // Get the absolute path of pixel.png
  const imagePath = path.resolve(__dirname, '../pixel.png');

  if (!fs.existsSync(imagePath)) {
    const errorMessage = `[ERROR] Image not found at: ${imagePath}`;
    console.error(errorMessage);
    await saveLogToSupabase(errorMessage);
    res.status(404).send('Image not found');
    return;
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store'); // Prevent caching of the pixel
  fs.createReadStream(imagePath).pipe(res);
};