import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { apiLimiter } from '../../platform/config/rateLimiter';

const router = Router();

router.get('/', apiLimiter, requireAuth, requireRole('admin', 'staff'), statsController.getStats);

export default router;
