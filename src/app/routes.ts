import { Router } from 'express';
import authRoutes from '../features/auth/api/auth.routes';
import ordersRoutes from '../features/orders/api/orders.routes';
import usersRoutes from '../features/users/api/users.routes';
import categoriesRoutes from '../features/categories/api/categories.routes';
import galleryRoutes from '../features/gallery/api/gallery.routes';
import uploadsRoutes from '../features/uploads/api/uploads.routes';
import recoveryRoutes from '../features/recovery/api/recovery.routes';
import reviewsRoutes from '../features/reviews/api/reviews.routes';
import statsRoutes from '../features/stats/api/stats.routes';
import chatbotRoutes from '../features/chatbot/api/chatbot.routes';
import contactRoutes from '../features/contact/api/contact.routes';

const router = Router();

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
