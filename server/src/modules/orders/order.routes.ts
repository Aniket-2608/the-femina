import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.get('/my-orders', authenticate, OrderController.getMyOrders);
router.get('/my-orders/:orderId', authenticate, OrderController.getOrderById);

export default router;
