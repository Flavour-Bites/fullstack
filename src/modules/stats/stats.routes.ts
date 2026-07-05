import { Router } from 'express';
import { statsController } from './stats.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'staff'), statsController.getStats);

export default router;
