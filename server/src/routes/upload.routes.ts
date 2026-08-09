import { Router, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import busboy from 'busboy';
import { bucket } from '../config/firebase.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getDownloadURL } from 'firebase-admin/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

interface UploadedFileInfo {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

const handleUpload = (req: Request, res: Response, isMultiple: boolean) => {
  try {
    const bb = busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } });
    const isFirebase = process.env.STORAGE_MODE === 'firebase';
    const uploads: UploadedFileInfo[] = [];
    const filePromises: Promise<void>[] = [];

    bb.on('file', (name, file, info) => {
      const { filename: originalName, mimeType } = info;

      if (!ALLOWED_TYPES.includes(mimeType)) {
        file.resume(); // Discard the stream
        return;
      }

      const ext = path.extname(originalName);
      const uniqueName = `${uuidv4()}${ext}`;
      let size = 0;

      const filePromise = new Promise<void>((resolve, reject) => {
        file.on('data', (data) => {
          size += data.length;
        });

        if (isFirebase) {
          const destFileName = `uploads/${uniqueName}`;
          const token = uuidv4();
          const bucketFile = bucket.file(destFileName);
          const writeStream = bucketFile.createWriteStream({
            metadata: {
              contentType: mimeType,
              metadata: {
                firebaseStorageDownloadTokens: token
              }
            }
          });

          file.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              const fileUrl = await getDownloadURL(bucketFile);
              uploads.push({
                url: fileUrl,
                filename: uniqueName,
                originalName,
                size,
                mimetype: mimeType,
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          });
          writeStream.on('error', reject);
        } else {
          // Local storage mode
          const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const finalPath = path.join(uploadsDir, uniqueName);
          const writeStream = fs.createWriteStream(finalPath);
          
          file.pipe(writeStream);

          writeStream.on('finish', () => {
            const fileUrl = `/uploads/${uniqueName}`;
            uploads.push({
              url: fileUrl,
              filename: uniqueName,
              originalName,
              size,
              mimetype: mimeType,
            });
            resolve();
          });
          writeStream.on('error', reject);
        }
      });

      filePromises.push(filePromise);
    });

    bb.on('close', async () => {
      try {
        await Promise.all(filePromises);
        if (uploads.length === 0) {
          res.status(400).json({ error: 'No files uploaded or file type not allowed' });
          return;
        }
        if (isMultiple) {
          res.status(201).json(uploads);
        } else {
          res.status(201).json(uploads[0]);
        }
      } catch (err: any) {
        console.error('Error in file upload processing:', err);
        res.status(500).json({ error: 'Failed to process files', details: err?.message || err });
      }
    });

    bb.on('error', (err: any) => {
      console.error('Busboy error:', err);
      res.status(500).json({ error: 'Failed to upload files', details: err?.message || err });
    });

    if ((req as any).rawBody) {
      bb.end((req as any).rawBody);
    } else {
      req.pipe(bb);
    }
  } catch (err: any) {
    console.error('Error starting upload:', err);
    res.status(500).json({ error: 'Failed to start upload', details: err?.message || err });
  }
};

// ── POST /api/upload — Upload single file (Admin) ──
router.post('/', requireAuth, (req: Request, res: Response) => {
  handleUpload(req, res, false);
});

// ── POST /api/upload/multiple — Upload multiple files (Admin) ──
router.post('/multiple', requireAuth, (req: Request, res: Response) => {
  handleUpload(req, res, true);
});

export default router;
