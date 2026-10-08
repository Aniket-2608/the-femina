import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProducts(req.query);
      return ApiResponse.success(res, 'Products retrieved', result.products, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const result = await ProductService.getProductBySlug(slug);
      return ApiResponse.success(res, 'Product details retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getTaxonomy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getTaxonomy();
      return ApiResponse.success(res, 'Taxonomy retrieved', result);
    } catch (error) {
      return next(error);
    }
  }
}
