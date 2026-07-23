import { Router } from 'express';
import { statsController } from './stats.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'staff'), statsController.getStats);

export default router;
