import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { siteSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// ── GET /api/settings — Get all public settings ──
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(siteSettings);

    // Transform array to key-value object
    const settings: Record<string, unknown> = {};
    for (const row of result) {
      settings[row.key] = row.value;
    }

    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── GET /api/settings/:key — Get specific setting ──
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, req.params.key));

    if (result.length === 0) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// ── PUT /api/settings/:key — Update setting (Admin) ──
router.put('/:key', requireAuth, async (req: Request, res: Response) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      res.status(400).json({ error: 'value is required' });
      return;
    }

    // Upsert: update if exists, insert if not
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, req.params.key));

    let result;
    if (existing.length > 0) {
      result = await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, req.params.key))
        .returning();
    } else {
      result = await db
        .insert(siteSettings)
        .values({ key: req.params.key, value })
        .returning();
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
