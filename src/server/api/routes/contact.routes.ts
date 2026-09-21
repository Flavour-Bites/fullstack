import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { validate } from '../../platform/middleware/validate';
import { contactFormSchema } from '../../modules/contact/contact.schemas';

const router = Router();

router.post('/', validate(contactFormSchema), contactController.submit);

export default router;