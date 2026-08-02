import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { bookings } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequired, validateMobile, sanitizeString, validateUUID } from '../utils/validators.js';

const router = Router();

// ── POST /api/bookings — Submit booking (Public) ──
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, mobile, serviceName, eventDate, preferredTime, notes, selectedAddons } = req.body;

    const validationError = validateRequired({ customerName, mobile, serviceName, eventDate });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    if (!validateMobile(mobile)) {
      res.status(400).json({ error: 'Invalid mobile number' });
      return;
    }

    const result = await db.insert(bookings).values({
      customerName: sanitizeString(customerName),
      mobile: mobile.replace(/[\s-]/g, ''),
      serviceName: sanitizeString(serviceName),
      eventDate: eventDate,
      preferredTime: preferredTime ? sanitizeString(preferredTime) : null,
      notes: notes ? sanitizeString(notes) : null,
      selectedAddons: selectedAddons || null,
      status: 'pending',
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ── GET /api/bookings — List all bookings (Admin) ──
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    let result;

    if (status && status !== 'all') {
      result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.status, status))
        .orderBy(desc(bookings.createdAt));
    } else {
      result = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt));
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ── PUT /api/bookings/:id — Update booking status (Admin) ──
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateUUID(req.params.id)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const result = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, req.params.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

export default router;
