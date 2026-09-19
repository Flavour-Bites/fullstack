import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';
import usersRoutes from './routes/users.routes';
import categoriesRoutes from './routes/categories.routes';
import galleryRoutes from './routes/gallery.routes';
import uploadsRoutes from './routes/uploads.routes';
import recoveryRoutes from './routes/recovery.routes';
import reviewsRoutes from './routes/reviews.routes';
import statsRoutes from './routes/stats.routes';
import chatbotRoutes from './routes/chatbot.routes';
import contactRoutes from './routes/contact.routes';
import healthRoutes from './routes/health.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/requests', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/gallery', galleryRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/stats', statsRoutes);
router.use('/chat', chatbotRoutes);
router.use('/contact', contactRoutes);

export default router;
