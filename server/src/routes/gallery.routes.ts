import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { gallery } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateUUID } from '../utils/validators.js';

const router = Router();

// ── GET /api/gallery — List gallery images (Public) ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    let query = db.select().from(gallery).orderBy(asc(gallery.sortOrder));

    if (category && category !== 'all') {
      const result = await db
        .select()
        .from(gallery)
        .where(eq(gallery.category, category))
        .orderBy(asc(gallery.sortOrder));
      res.json(result);
      return;
    }

    const result = await query;
    res.json(result);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// ── POST /api/gallery — Add gallery image(s) (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { images } = req.body; // Array of { imageUrl, thumbnailUrl?, category?, caption? }

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: 'images array is required' });
      return;
    }

    const values = images.map((img: any, index: number) => ({
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl || null,
      category: img.category || 'general',
      caption: img.caption || null,
      sortOrder: img.sortOrder ?? index,
    }));

    const result = await db.insert(gallery).values(values).returning();
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding gallery images:', err);
    res.status(500).json({ error: 'Failed to add gallery images' });
  }
});

// ── DELETE /api/gallery/:id — Delete gallery image (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid gallery image ID' });
      return;
    }

    const result = await db
      .delete(gallery)
      .where(eq(gallery.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Gallery image not found' });
      return;
    }

    res.json({ message: 'Gallery image deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery image:', err);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// ── PUT /api/gallery/:id — Update gallery image (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid gallery image ID' });
      return;
    }
    
    const { category, caption } = req.body;
    const updates: any = {};
    if (category !== undefined) updates.category = category;
    if (caption !== undefined) updates.caption = caption;

    const result = await db
      .update(gallery)
      .set(updates)
      .where(eq(gallery.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Gallery image not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating gallery image:', err);
    res.status(500).json({ error: 'Failed to update gallery image' });
  }
});

// ── PUT /api/gallery/reorder — Reorder gallery images (Admin) ──
router.put('/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'items must be an array' });
      return;
    }

    for (const item of items) {
      await db
        .update(gallery)
        .set({ sortOrder: item.sortOrder })
        .where(eq(gallery.id, item.id));
    }

    res.json({ message: 'Gallery reordered successfully' });
  } catch (err) {
    console.error('Error reordering gallery:', err);
    res.status(500).json({ error: 'Failed to reorder gallery' });
  }
});

export default router;
