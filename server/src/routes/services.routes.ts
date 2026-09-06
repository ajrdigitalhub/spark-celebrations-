import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { services } from '../db/schema.js';
import { eq, asc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequired, validateUUID, sanitizeString } from '../utils/validators.js';

const router = Router();

// ── GET /api/services — List active services (Public) ──
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(
        sql`CASE WHEN ${services.sortOrder} = 0 THEN 9999 ELSE ${services.sortOrder} END ASC`,
        asc(services.createdAt)
      );
    res.json(result);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ── GET /api/services/all — List ALL services (Admin) ──
router.get('/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(services)
      .orderBy(
        sql`CASE WHEN ${services.sortOrder} = 0 THEN 9999 ELSE ${services.sortOrder} END ASC`,
        asc(services.createdAt)
      );
    res.json(result);
  } catch (err) {
    console.error('Error fetching all services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ── GET /api/services/:id — Get single service (Public) ──
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid service ID' });
      return;
    }
    const result = await db
      .select()
      .from(services)
      .where(eq(services.id, req.params.id));

    if (result.length === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// ── POST /api/services — Create service (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, features, price, imageUrl, galleryUrls, isActive, bookingEnabled, sortOrder, availableVenues } = req.body;

    const validationError = validateRequired({ title });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const result = await db.insert(services).values({
      title: sanitizeString(title),
      description: description ? sanitizeString(description) : null,
      features: features || [],
      price: price || null,
      imageUrl: imageUrl || null,
      galleryUrls: galleryUrls || null,
      isActive: isActive ?? true,
      bookingEnabled: bookingEnabled ?? true,
      sortOrder: sortOrder ?? 0,
      availableVenues: availableVenues || [],
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// ── PUT /api/services/:id — Update service (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid service ID' });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const allowedFields = ['title', 'description', 'features', 'price', 'imageUrl', 'galleryUrls', 'isActive', 'bookingEnabled', 'sortOrder', 'availableVenues'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string'
          ? sanitizeString(req.body[field])
          : req.body[field];
      }
    }

    const result = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// ── DELETE /api/services/:id — Delete service (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid service ID' });
      return;
    }

    const result = await db
      .delete(services)
      .where(eq(services.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ── PUT /api/services/reorder — Reorder services (Admin) ──
router.put('/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // [{ id, sortOrder }]
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'items must be an array' });
      return;
    }

    for (const item of items) {
      await db
        .update(services)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(services.id, item.id));
    }

    res.json({ message: 'Services reordered successfully' });
  } catch (err) {
    console.error('Error reordering services:', err);
    res.status(500).json({ error: 'Failed to reorder services' });
  }
});

export default router;
