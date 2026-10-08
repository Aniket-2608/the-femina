import { Router } from 'express';
import { ProductController } from './product.controller.js';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/taxonomy', ProductController.getTaxonomy);
router.get('/:slug', ProductController.getProductBySlug);

export default router;
