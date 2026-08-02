import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { testimonials } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequired, validateRating, sanitizeString, validateUUID } from '../utils/validators.js';

const router = Router();

// ── GET /api/testimonials — List testimonials (Public) ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const featured = req.query.featured;

    if (featured === 'true') {
      const result = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isFeatured, true))
        .orderBy(asc(testimonials.sortOrder));
      res.json(result);
      return;
    }

    const result = await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder));
    res.json(result);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// ── POST /api/testimonials — Create testimonial (Admin) ──
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { customerName, review, rating, photoUrl, isFeatured, sortOrder } = req.body;

    const validationError = validateRequired({ customerName, review });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    if (rating !== undefined && !validateRating(rating)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const result = await db.insert(testimonials).values({
      customerName: sanitizeString(customerName),
      review: sanitizeString(review),
      rating: rating ?? 5,
      photoUrl: photoUrl || null,
      isFeatured: isFeatured ?? false,
      sortOrder: sortOrder ?? 0,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// ── PUT /api/testimonials/:id — Update testimonial (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid testimonial ID' });
      return;
    }

    const updates: Record<string, unknown> = {};
    const allowedFields = ['customerName', 'review', 'rating', 'photoUrl', 'isFeatured', 'sortOrder'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string'
          ? sanitizeString(req.body[field])
          : req.body[field];
      }
    }

    if (updates.rating !== undefined && !validateRating(updates.rating as number)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const result = await db
      .update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating testimonial:', err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// ── DELETE /api/testimonials/:id — Delete testimonial (Admin) ──
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid testimonial ID' });
      return;
    }

    const result = await db
      .delete(testimonials)
      .where(eq(testimonials.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
