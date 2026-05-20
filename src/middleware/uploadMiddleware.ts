import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const uploadRoot = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Dozvoljen je samo upload slika.'));
    return cb(null, true);
  }
});
