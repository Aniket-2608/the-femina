import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorizeRoles.js';
import { AdminRoles, UserRoles } from '../../constants/roles.js';

const router = Router();

// Protect all admin routes with authentication and staff role authorization
router.use(authenticate, authorizeRoles(...AdminRoles));

// Dashboard
router.get('/dashboard', AdminController.getDashboardMetrics);

// Articles / Master Products
router.get('/products', AdminController.getProducts);
router.post('/products', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER), AdminController.createProduct);
router.put('/products/:id', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER), AdminController.updateProduct);

// Inventory
router.post('/inventory/adjust', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER), AdminController.adjustInventory);
router.get('/inventory/ledger', AdminController.getInventoryLedger);

// Orders
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.SALES_MANAGER, UserRoles.INVENTORY_MANAGER), AdminController.updateOrderStatus);

// Accounting & Expenses
router.get('/expenses', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT), AdminController.getExpenses);
router.post('/expenses', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ACCOUNTANT), AdminController.createExpense);

// Procurement & Vendors
router.get('/vendors', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER, UserRoles.ACCOUNTANT), AdminController.getVendors);
router.post('/vendors', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER), AdminController.createVendor);
router.post('/purchases', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.INVENTORY_MANAGER, UserRoles.ACCOUNTANT), AdminController.createPurchaseOrder);

// Customer Directory
router.get('/customers', authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.SALES_MANAGER), AdminController.getCustomers);

// Audit Trail
router.get('/audit-logs', authorizeRoles(UserRoles.SUPER_ADMIN), AdminController.getAuditLogs);

export default router;
