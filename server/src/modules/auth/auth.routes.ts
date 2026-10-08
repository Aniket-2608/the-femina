import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailOtpSchema,
  VerifyPhoneOtpSchema,
  ResendOtpSchema,
} from './auth.validation.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.post('/register', validateRequest(RegisterSchema), AuthController.register);
router.post('/verify-email-otp', validateRequest(VerifyEmailOtpSchema), AuthController.verifyEmailOtp);
router.post('/verify-phone-otp', validateRequest(VerifyPhoneOtpSchema), AuthController.verifyPhoneOtp);
router.post('/resend-otp', validateRequest(ResendOtpSchema), AuthController.resendOtp);
router.post('/login', validateRequest(LoginSchema), AuthController.login);

// Authenticated user profile routes
router.get('/me', authenticate, AuthController.getMe);
router.put('/me', authenticate, AuthController.updateMe);
router.post('/addresses', authenticate, AuthController.addAddress);
router.delete('/addresses/:addressId', authenticate, AuthController.deleteAddress);

export default router;
