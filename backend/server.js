import { spawn } from 'child_process';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8090;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Start PocketBase
const pocketbaseProcess = spawn('./pocketbase', ['serve'], {
  cwd: __dirname,
  stdio: 'inherit'
});

pocketbaseProcess.on('error', (err) => {
  console.error('Failed to start PocketBase:', err);
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
