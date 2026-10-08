import { Router } from 'express';
import { CheckoutController } from './checkout.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { ValidateCartSchema, CreateOrderSchema } from './checkout.validation.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Cart validation is accessible to both guests and authenticated users
router.post('/validate-cart', optionalAuthenticate, validateRequest(ValidateCartSchema), CheckoutController.validateCart);

// Order creation strictly requires authenticated and verified user
router.post('/create-order', authenticate, validateRequest(CreateOrderSchema), CheckoutController.createOrder);

export default router;
