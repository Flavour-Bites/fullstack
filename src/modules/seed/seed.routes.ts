import { Router } from 'express';
import { seedService } from './seed.service.js';

const router = Router();

/**
 * POST /api/seed
 *
 * Seed the database with sample categories, cake requests, and gallery items.
 * Only available in non-production environments (dev/staging).
 *
 * Response (200): { success: true, counts: { categories, requests, galleryItems } }
 * Response (403): { success: false, error: 'Seeding is not available in production.' }
 */
router.post('/', async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ success: false, error: 'Seeding is not available in production.' });
    return;
  }

  try {
    const counts = await seedService.seedDatabase();
    res.json({ success: true, counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Seed] Database seeding failed:', message);
    res.status(500).json({ success: false, error: 'Seeding failed: ' + message });
  }
});

export default router;
