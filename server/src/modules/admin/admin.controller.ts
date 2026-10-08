import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class AdminController {
  private static getAdminUser(req: Request) {
    if (!req.user) throw new AppError('Admin authentication required', 401);
    return {
      id: req.user.userId,
      name: req.user.email,
      role: req.user.role,
    };
  }

  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getDashboardMetrics();
      return ApiResponse.success(res, 'Dashboard metrics retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = (req.query.search as string) || '';
      const result = await AdminService.getProducts(page, limit, search);
      return ApiResponse.success(res, 'Articles retrieved', result.products, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const result = await AdminService.createProduct(req.body, adminUser);
      return ApiResponse.success(res, 'Article created successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const { id } = req.params;
      const result = await AdminService.updateProduct(id, req.body, adminUser);
      return ApiResponse.success(res, 'Article updated successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async adjustInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const { variantId, delta, type, reason } = req.body;
      const result = await AdminService.adjustInventory(variantId, delta, type, reason, adminUser);
      return ApiResponse.success(res, 'Inventory adjusted successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getInventoryLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 30;
      const result = await AdminService.getInventoryLedger(page, limit);
      return ApiResponse.success(res, 'Inventory ledger retrieved', result.transactions, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const status = req.query.status as string;
      const result = await AdminService.getOrders(page, limit, status);
      return ApiResponse.success(res, 'Orders retrieved', result.orders, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const { id } = req.params;
      const { status, note } = req.body;
      const result = await AdminService.updateOrderStatus(id, status, note, adminUser);
      return ApiResponse.success(res, 'Order status updated successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const category = req.query.category as string;
      const result = await AdminService.getExpenses(page, limit, category);
      return ApiResponse.success(res, 'Expenses retrieved', result, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const result = await AdminService.createExpense(req.body, adminUser);
      return ApiResponse.success(res, 'Expense recorded successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const vendors = await AdminService.getVendors();
      return ApiResponse.success(res, 'Vendors retrieved', vendors);
    } catch (error) {
      return next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const result = await AdminService.createVendor(req.body, adminUser);
      return ApiResponse.success(res, 'Vendor created successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUser = AdminController.getAdminUser(req);
      const result = await AdminService.createPurchaseOrder(req.body, adminUser);
      return ApiResponse.success(res, 'Purchase Order stocked successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await AdminService.getCustomers(page, limit);
      return ApiResponse.success(res, 'Customers directory retrieved', result.customers, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 40;
      const result = await AdminService.getAuditLogs(page, limit);
      return ApiResponse.success(res, 'Audit trail retrieved', result.logs, 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}
