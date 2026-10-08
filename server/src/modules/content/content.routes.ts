import { Router } from 'express';
import { ContentController } from './content.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorizeRoles.js';
import { UserRoles } from '../../constants/roles.js';

const router = Router();

// Public routes for storefront
router.get('/content', ContentController.getStoreContent);
router.get('/branches', ContentController.getBranches);

// Admin CMS routes
router.put(
  '/content',
  authenticate,
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.CONTENT_MANAGER),
  ContentController.updateStoreContent
);
router.post(
  '/branches',
  authenticate,
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.CONTENT_MANAGER),
  ContentController.createBranch
);

export default router;
