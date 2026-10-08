import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.post('/verify', authenticate, PaymentController.verifyPayment);

export default router;
