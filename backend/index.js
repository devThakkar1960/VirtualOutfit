require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const WebSocket = require('ws');
const { swap_cloths_image_to_image } = require('./swapCloths');

const app = express();
const PORT = process.env.PORT || 3000;

const TEMP_IMAGE_DIR = process.env.TEMP_IMAGE_DIR || path.join('public', 'temp_images');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

fs.mkdirSync(path.join(__dirname, TEMP_IMAGE_DIR), { recursive: true });

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use('/temp_images', express.static(path.join(__dirname, TEMP_IMAGE_DIR)));

// Set up multer for file uploads
const uploadDir = path.join(__dirname, TEMP_IMAGE_DIR, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// === Route: Upload image ===
app.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.json({ name: path.join('upload', req.file.filename) });
});

// === Route: Cloth Swap ===
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fsPromises = require('fs').promises;

async function downloadImageToUploads(url, filename) {
  const filePath = path.join(__dirname, 'public', 'temp_images', 'uploads', filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

app.post('/api/cloth-swap', async (req, res) => {
  try {
    const { input_url, cloth_url, cloth_type = "overall" } = req.body;
    if (!input_url || !cloth_url) {
      return res.status(400).json({ error: "Missing input_url or cloth_url" });
    }

    // Download both images
    const inputFileName = `input_${uuidv4()}.jpg`;
    const clothFileName = `cloth_${uuidv4()}.jpg`;

    const inputPath = await downloadImageToUploads(input_url, inputFileName);
    const clothPath = await downloadImageToUploads(cloth_url, clothFileName);
    
    const result = await swap_cloths_image_to_image(inputPath, clothPath, cloth_type);
    res.json(result);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const clientId = new URLSearchParams(req.url.split('?')[1]).get('clientId');
  console.log(`WebSocket connected: clientId=${clientId}`);

  ws.on('message', message => {
    console.log(`Message from ${clientId}:`, message.toString());
  });

  ws.send(JSON.stringify({ message: 'WebSocket connected!' }));
});

server.listen(PORT, () => {
  console.log(`Server running`);
});
