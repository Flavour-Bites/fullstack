import { Router } from 'express';
import { contactController } from './contact.controller.js';
import { validate } from '../../app/middleware/validate.js';
import { contactFormSchema } from './contact.schemas.js';

const router = Router();

router.post('/', validate(contactFormSchema), contactController.submit);

export default router;