import { Router } from 'express';
import { contactController } from './contact.controller';
import { validate } from '../../../app/middleware/validate';
import { contactFormSchema } from './contact.schemas';

const router = Router();

router.post('/', validate(contactFormSchema), contactController.submit);

export default router;