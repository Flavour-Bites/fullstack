import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import categoriesRoutes from '../modules/categories/categories.routes.js';
import galleryRoutes from '../modules/gallery/gallery.routes.js';
import uploadsRoutes from '../modules/uploads/uploads.routes.js';
import recoveryRoutes from '../modules/recovery/recovery.routes.js';
import reviewsRoutes from '../modules/reviews/reviews.routes.js';
import statsRoutes from '../modules/stats/stats.routes.js';
import chatbotRoutes from '../modules/chatbot/chatbot.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/requests', ordersRoutes);
router.use('/payments', paymentRoutes);
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
