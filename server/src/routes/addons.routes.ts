import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { addons } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// ── GET /api/addons — Public access to active addons ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const admin = req.query.admin === 'true';

    let data;
    if (admin) {
      data = await db.select().from(addons).orderBy(asc(addons.sortOrder));
    } else {
      data = await db
        .select()
        .from(addons)
        .where(eq(addons.isActive, true))
        .orderBy(asc(addons.sortOrder));
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

// ── POST /api/addons — Create a new addon (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, price, imageUrl, isActive, sortOrder } = req.body;
    const [newItem] = await db
      .insert(addons)
      .values({
        title,
        description,
        price,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      })
      .returning();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating addon:', error);
    res.status(500).json({ error: 'Failed to create addon' });
  }
});

// ── PUT /api/addons/:id — Update an addon (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, isActive, sortOrder } = req.body;
    const [updatedItem] = await db
      .update(addons)
      .set({
        title,
        description,
        price,
        imageUrl,
        isActive,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(addons.id, id))
      .returning();

    if (!updatedItem) {
      res.status(404).json({ error: 'Addon not found' });
      return;
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating addon:', error);
    res.status(500).json({ error: 'Failed to update addon' });
  }
});

// ── DELETE /api/addons/:id — Delete an addon (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [deletedItem] = await db.delete(addons).where(eq(addons.id, id)).returning();
    if (!deletedItem) {
      res.status(404).json({ error: 'Addon not found' });
      return;
    }
    res.json({ message: 'Addon deleted successfully' });
  } catch (error) {
    console.error('Error deleting addon:', error);
    res.status(500).json({ error: 'Failed to delete addon' });
  }
});

export default router;
