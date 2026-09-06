import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { heroItems } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// ── GET /api/hero — List all hero items ──
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(heroItems).orderBy(asc(heroItems.sortOrder));
    res.json(items);
  } catch (error) {
    console.error('Error fetching hero items:', error);
    res.status(500).json({ error: 'Failed to fetch hero items' });
  }
});

// ── POST /api/hero — Create a new hero item (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { mediaUrl, mobileMediaUrl, mediaType, caption, isActive, sortOrder } = req.body;
    const [newItem] = await db
      .insert(heroItems)
      .values({
        mediaUrl,
        mobileMediaUrl,
        mediaType,
        caption,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      })
      .returning();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating hero item:', error);
    res.status(500).json({ error: 'Failed to create hero item' });
  }
});

// ── PUT /api/hero/:id — Update a hero item (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mediaUrl, mobileMediaUrl, mediaType, caption, isActive, sortOrder } = req.body;

    const [updatedItem] = await db
      .update(heroItems)
      .set({
        mediaUrl,
        mobileMediaUrl,
        mediaType,
        caption,
        isActive,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(heroItems.id, id))
      .returning();

    if (!updatedItem) {
      res.status(404).json({ error: 'Hero item not found' });
      return;
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating hero item:', error);
    res.status(500).json({ error: 'Failed to update hero item' });
  }
});

// ── DELETE /api/hero/:id — Delete a hero item (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [deletedItem] = await db
      .delete(heroItems)
      .where(eq(heroItems.id, id))
      .returning();

    if (!deletedItem) {
      res.status(404).json({ error: 'Hero item not found' });
      return;
    }
    res.json({ message: 'Hero item deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero item:', error);
    res.status(500).json({ error: 'Failed to delete hero item' });
  }
});

export default router;
