import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { validate } from '../../platform/middleware/validate';
import { contactLimiter } from '../../platform/config/rateLimiter';
import { contactFormSchema } from '../../modules/contact/contact.schemas';

const router = Router();

router.post('/', contactLimiter, validate(contactFormSchema), contactController.submit);

export default router;