import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { eventDecors } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// ── GET /api/event-decors — Public access to active items ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const admin = req.query.admin === 'true';

    let data;
    if (admin) {
      data = await db.select().from(eventDecors).orderBy(asc(eventDecors.sortOrder));
    } else {
      data = await db
        .select()
        .from(eventDecors)
        .where(eq(eventDecors.isActive, true))
        .orderBy(asc(eventDecors.sortOrder));
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching event decors:', error);
    res.status(500).json({ error: 'Failed to fetch event decors' });
  }
});

// ── POST /api/event-decors — Create a new item (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, price, imageUrl, type, isActive, sortOrder } = req.body;
    const [newItem] = await db
      .insert(eventDecors)
      .values({
        title,
        description,
        price,
        imageUrl,
        type: type || 'event',
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      })
      .returning();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating event decor:', error);
    res.status(500).json({ error: 'Failed to create event decor' });
  }
});

// ── PUT /api/event-decors/:id — Update an item (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, type, isActive, sortOrder } = req.body;
    const [updatedItem] = await db
      .update(eventDecors)
      .set({
        title,
        description,
        price,
        imageUrl,
        type,
        isActive,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(eventDecors.id, id))
      .returning();

    if (!updatedItem) {
      res.status(404).json({ error: 'Event decor not found' });
      return;
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating event decor:', error);
    res.status(500).json({ error: 'Failed to update event decor' });
  }
});

// ── DELETE /api/event-decors/:id — Delete an item (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [deletedItem] = await db.delete(eventDecors).where(eq(eventDecors.id, id)).returning();
    if (!deletedItem) {
      res.status(404).json({ error: 'Event decor not found' });
      return;
    }
    res.json({ message: 'Event decor deleted successfully' });
  } catch (error) {
    console.error('Error deleting event decor:', error);
    res.status(500).json({ error: 'Failed to delete event decor' });
  }
});

export default router;
