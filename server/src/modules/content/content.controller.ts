import { Request, Response, NextFunction } from 'express';
import { Content } from '../../models/Content.js';
import { Branch } from '../../models/Branch.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ContentController {
  static async getStoreContent(req: Request, res: Response, next: NextFunction) {
    try {
      let content = await Content.findOne().lean();
      if (!content) {
        const created = await Content.create({});
        content = await Content.findById(created._id).lean();
      }
      return ApiResponse.success(res, 'Store content retrieved', content);
    } catch (error) {
      return next(error);
    }
  }

  static async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await Branch.find({ isActive: true }).sort({ isFlagship: -1, createdAt: 1 }).lean();
      return ApiResponse.success(res, 'Branches retrieved', branches);
    } catch (error) {
      return next(error);
    }
  }

  static async updateStoreContent(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await Content.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      return ApiResponse.success(res, 'Store content updated', content);
    } catch (error) {
      return next(error);
    }
  }

  static async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await Branch.create(req.body);
      return ApiResponse.success(res, 'Branch created', branch, 201);
    } catch (error) {
      return next(error);
    }
  }
}
