const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const APP_PASSWORD = process.env.APP_PASSWORD || 'წასვლასაცხა';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Middleware to check password
const checkPassword = (req, res, next) => {
  const password = req.headers['x-password'];
  if (password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'გამოუყოფელი წვდომა' });
  }
  next();
};

// Load metadata from JSON file
function loadMetadata() {
  const metaFile = path.join(UPLOAD_DIR, 'metadata.json');
  if (fs.existsSync(metaFile)) {
    try {
      return JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Save metadata to JSON file
function saveMetadata(data) {
  const metaFile = path.join(UPLOAD_DIR, 'metadata.json');
  fs.writeFileSync(metaFile, JSON.stringify(data, null, 2));
}

// Routes

// Check auth
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'არასწორი პაროლი' });
  }
});

// Get all photos
app.get('/api/photos', checkPassword, (req, res) => {
  try {
    const metadata = loadMetadata();
    res.json(metadata);
  } catch (e) {
    res.status(500).json({ error: 'ფოტოების დამტვირთვა ვერ მოხერხდა' });
  }
});

// Upload photo
app.post('/api/upload', checkPassword, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ფაილი არ იყო გამოგზავნილი' });
  }

  try {
    const photoId = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const photoData = {
      id: photoId,
      name: req.file.originalname,
      filename: req.file.filename,
      type: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      timestamp: Date.now()
    };

    const metadata = loadMetadata();
    metadata.unshift(photoData);
    saveMetadata(metadata);

    res.json(photoData);
  } catch (e) {
    res.status(500).json({ error: 'ატვირთვა ვერ მოხერხდა' });
  }
});

// Download photo
app.get('/api/download/:filename', checkPassword, (req, res) => {
  try {
    const filepath = path.join(UPLOAD_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'ფაილი ვერ მოძებნილა' });
    }
    res.download(filepath);
  } catch (e) {
    res.status(500).json({ error: 'ჩამოტვირთვა ვერ მოხერხდა' });
  }
});

// Delete photo
app.delete('/api/photos/:id', checkPassword, (req, res) => {
  try {
    const metadata = loadMetadata();
    const photo = metadata.find(p => p.id === req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: 'ფოტო ვერ მოძებნილა' });
    }

    // Delete file
    const filepath = path.join(UPLOAD_DIR, photo.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Update metadata
    const updated = metadata.filter(p => p.id !== req.params.id);
    saveMetadata(updated);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'წაშლა ვერ მოხერხდა' });
  }
});

// Serve uploads as static files
app.use('/uploads', express.static(UPLOAD_DIR));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
