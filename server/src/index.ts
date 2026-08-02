import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import servicesRouter from './routes/services.routes.js';
import galleryRouter from './routes/gallery.routes.js';
import bookingsRouter from './routes/bookings.routes.js';
import flipbookRouter from './routes/flipbook.routes.js';
import testimonialsRouter from './routes/testimonials.routes.js';
import settingsRouter from './routes/settings.routes.js';
import uploadRouter from './routes/upload.routes.js';
import heroRouter from './routes/hero.routes.js';
import addonsRouter from './routes/addons.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security ─────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ─────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000'],
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Body Parsing ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (local uploads) ─────────────
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ── API Routes ───────────────────────────────
app.use('/api/services', servicesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/flipbook', flipbookRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/hero', heroRouter);
app.use('/api/addons', addonsRouter);

// ── Health Check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ──────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Error Handler ────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('🔴 Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Spark Celebrations API running at http://localhost:${PORT}`);
  console.log(`📦 Storage mode: ${process.env.STORAGE_MODE || 'local'}`);
  console.log(`🗄️  Database: Supabase PostgreSQL (via Drizzle ORM)\n`);
});

export default app;
