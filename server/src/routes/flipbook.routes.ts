import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { flipbook } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateUUID } from '../utils/validators.js';

const router = Router();

// ── GET /api/flipbook — Get active flipbook (Public) ──
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(flipbook)
      .where(eq(flipbook.isActive, true))
      .orderBy(desc(flipbook.updatedAt))
      .limit(1);

    if (result.length === 0) {
      res.json(null);
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching flipbook:', err);
    res.status(500).json({ error: 'Failed to fetch flipbook' });
  }
});

// ── GET /api/flipbook/all — Get all flipbooks (Admin) ──
router.get('/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(flipbook)
      .orderBy(desc(flipbook.updatedAt));
    res.json(result);
  } catch (err) {
    console.error('Error fetching flipbooks:', err);
    res.status(500).json({ error: 'Failed to fetch flipbooks' });
  }
});

// ── POST /api/flipbook — Upload new flipbook PDF (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { images, coverImage, backCoverImage } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: 'images array is required' });
      return;
    }

    // Deactivate all existing flipbooks
    await db.update(flipbook).set({ isActive: false, updatedAt: new Date() });

    // Insert new active flipbook
    const result = await db.insert(flipbook).values({
      images,
      coverImage: coverImage || null,
      backCoverImage: backCoverImage || null,
      isActive: true,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Error creating flipbook:', err);
    res.status(500).json({ error: 'Failed to create flipbook' });
  }
});

// ── PUT /api/flipbook/:id — Toggle flipbook publish (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid flipbook ID' });
      return;
    }

    const { isActive, coverImage, backCoverImage } = req.body;

    // If activating, deactivate all others first
    if (isActive) {
      await db.update(flipbook).set({ isActive: false, updatedAt: new Date() });
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (backCoverImage !== undefined) updateData.backCoverImage = backCoverImage;

    const result = await db
      .update(flipbook)
      .set(updateData)
      .where(eq(flipbook.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Flipbook not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating flipbook:', err);
    res.status(500).json({ error: 'Failed to update flipbook' });
  }
});

// ── PUT /api/flipbook/:id/pages — Update flipbook images (Admin) ──
router.put('/:id/pages', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid flipbook ID' });
      return;
    }

    const { images } = req.body;

    if (!Array.isArray(images)) {
      res.status(400).json({ error: 'images array is required' });
      return;
    }

    const result = await db
      .update(flipbook)
      .set({ images, updatedAt: new Date() })
      .where(eq(flipbook.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Flipbook not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating flipbook pages:', err);
    res.status(500).json({ error: 'Failed to update flipbook pages' });
  }
});

// ── DELETE /api/flipbook/:id — Delete flipbook (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid flipbook ID' });
      return;
    }

    const result = await db
      .delete(flipbook)
      .where(eq(flipbook.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Flipbook not found' });
      return;
    }

    res.json({ message: 'Flipbook deleted successfully' });
  } catch (err) {
    console.error('Error deleting flipbook:', err);
    res.status(500).json({ error: 'Failed to delete flipbook' });
  }
});

export default router;
