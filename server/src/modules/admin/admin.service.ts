import { Types } from 'mongoose';
import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Order } from '../../models/Order.js';
import { User } from '../../models/User.js';
import { InventoryTransaction } from '../../models/InventoryTransaction.js';
import { Expense, ExpenseCategoryType } from '../../models/Expense.js';
import { Vendor } from '../../models/Vendor.js';
import { PurchaseOrder } from '../../models/PurchaseOrder.js';
import { Category } from '../../models/Category.js';
import { Fabric } from '../../models/Fabric.js';
import { Occasion } from '../../models/Occasion.js';
import { AuditLog } from '../../models/AuditLog.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { OrderStatus, PaymentStatus } from '../../constants/orderStatus.js';

export class AdminService {
  // 1. Executive Dashboard KPIs & Analytics
  static async getDashboardMetrics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
    const startOfYear = new Date(startOfToday.getFullYear(), 0, 1);

    const [
      allPaidOrders,
      todayOrders,
      monthOrders,
      yearOrders,
      pendingOrdersCount,
      processingOrdersCount,
      totalCustomers,
      lowStockVariants,
      allVariants,
      allExpenses,
    ] = await Promise.all([
      Order.find({ 'paymentInfo.status': PaymentStatus.PAID }).lean(),
      Order.find({ 'paymentInfo.status': PaymentStatus.PAID, createdAt: { $gte: startOfToday } }).lean(),
      Order.find({ 'paymentInfo.status': PaymentStatus.PAID, createdAt: { $gte: startOfMonth } }).lean(),
      Order.find({ 'paymentInfo.status': PaymentStatus.PAID, createdAt: { $gte: startOfYear } }).lean(),
      Order.countDocuments({ orderStatus: OrderStatus.CONFIRMED }),
      Order.countDocuments({ orderStatus: { $in: [OrderStatus.PROCESSING, OrderStatus.PACKED] } }),
      User.countDocuments({ role: 'customer' }),
      ProductVariant.find({
        isActive: true,
        $expr: { $lte: ['$availableQuantity', 5] },
      })
        .populate('productId', 'name articleCode slug')
        .lean(),
      ProductVariant.find({ isActive: true }).select('costPrice price stockQuantity availableQuantity').lean(),
      Expense.find().lean(),
    ]);

    // Financial calculations
    const todaySales = todayOrders.reduce((sum, o) => sum + o.pricing.totalPayable, 0);
    const monthlySales = monthOrders.reduce((sum, o) => sum + o.pricing.totalPayable, 0);
    const yearlySales = yearOrders.reduce((sum, o) => sum + o.pricing.totalPayable, 0);
    const totalSales = allPaidOrders.reduce((sum, o) => sum + o.pricing.totalPayable, 0);

    // COGS & Gross Profit
    let totalCOGS = 0;
    allPaidOrders.forEach((order) => {
      order.items.forEach((item) => {
        totalCOGS += (item.unitCost || 0) * item.quantity;
      });
    });

    const grossProfit = totalSales - totalCOGS;
    const totalOperatingExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paymentGatewayCharges = Math.round(totalSales * 0.02); // 2% estimated Razorpay fee
    const netProfit = grossProfit - totalOperatingExpenses - paymentGatewayCharges;

    // Inventory Valuation
    const totalInventoryValueAtCost = allVariants.reduce((sum, v) => sum + v.costPrice * v.stockQuantity, 0);
    const totalInventoryValueAtRetail = allVariants.reduce((sum, v) => sum + v.price * v.stockQuantity, 0);

    // Recent 5 Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();

    return {
      sales: {
        todaySales,
        monthlySales,
        yearlySales,
        totalSales,
        todayOrdersCount: todayOrders.length,
        totalOrdersCount: allPaidOrders.length,
      },
      ordersPipeline: {
        pendingOrders: pendingOrdersCount,
        processingOrders: processingOrdersCount,
      },
      financialSummary: {
        totalRevenue: totalSales,
        cogs: totalCOGS,
        grossProfit,
        operatingExpenses: totalOperatingExpenses,
        gatewayFees: paymentGatewayCharges,
        netProfit,
        profitMargin: totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) + '%' : '0%',
      },
      inventory: {
        totalVariantsCount: allVariants.length,
        lowStockCount: lowStockVariants.length,
        lowStockAlerts: lowStockVariants.slice(0, 5),
        valuationAtCost: totalInventoryValueAtCost,
        valuationAtRetail: totalInventoryValueAtRetail,
      },
      customers: {
        total: totalCustomers,
      },
      recentOrders,
    };
  }

  // 2. Product Master Articles CRUD
  static async getProducts(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { articleCode: { $regex: search, $options: 'i' } },
        { 'attributes.fabric': { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const productIds = products.map((p) => p._id);
    const variants = await ProductVariant.find({ productId: { $in: productIds } }).lean();

    const result = products.map((p) => {
      const pVariants = variants.filter((v) => v.productId.toString() === p._id.toString());
      return {
        ...p,
        variants: pVariants,
        totalStock: pVariants.reduce((sum, v) => sum + v.stockQuantity, 0),
        availableStock: pVariants.reduce((sum, v) => sum + v.availableQuantity, 0),
      };
    });

    return {
      products: result,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createProduct(data: Record<string, any>, adminUser: { id: string; name: string; role: string }) {
    const { variants, ...productData } = data;

    // Check unique article code and slug
    const existing = await Product.findOne({
      $or: [{ articleCode: productData.articleCode.toUpperCase() }, { slug: productData.slug }],
    });
    if (existing) {
      throw new AppError('Product with this article code or slug already exists.', 409);
    }

    const totalStock = Array.isArray(variants) ? variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) : 0;

    const newProduct = await Product.create({
      ...productData,
      articleCode: productData.articleCode.toUpperCase(),
      totalStock,
    });

    const createdVariants = [];
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const variantDoc = await ProductVariant.create({
          ...v,
          productId: newProduct._id,
          availableQuantity: v.stockQuantity || 0,
        });
        createdVariants.push(variantDoc);

        // Record Inward Transaction
        await InventoryTransaction.create({
          variantId: variantDoc._id,
          productId: newProduct._id,
          sku: variantDoc.sku,
          type: 'MANUAL_ADJUSTMENT',
          quantityDelta: variantDoc.stockQuantity,
          previousStock: 0,
          newStock: variantDoc.stockQuantity,
          reason: 'Initial creation stock entry',
          performedBy: new Types.ObjectId(adminUser.id),
          costAtTransaction: variantDoc.costPrice,
        });
      }
    }

    // Audit Log
    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'CREATE_PRODUCT',
      module: 'PRODUCTS',
      entityId: newProduct._id.toString(),
      details: `Created new master article ${newProduct.name} (${newProduct.articleCode}) with ${createdVariants.length} variants.`,
    });

    return { product: newProduct, variants: createdVariants };
  }

  static async updateProduct(id: string, data: Record<string, any>, adminUser: { id: string; name: string; role: string }) {
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new AppError('Product not found.', 404);

    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'UPDATE_PRODUCT',
      module: 'PRODUCTS',
      entityId: id,
      details: `Updated product ${product.name} (${product.articleCode}).`,
    });

    return product;
  }

  // 3. Inventory Adjustments & Ledger
  static async adjustInventory(
    variantId: string,
    delta: number,
    type: 'MANUAL_ADJUSTMENT' | 'DAMAGED_WRITEOFF',
    reason: string,
    adminUser: { id: string; name: string; role: string }
  ) {
    const variant = await ProductVariant.findById(variantId);
    if (!variant) throw new AppError('Variant not found.', 404);

    const previousStock = variant.stockQuantity;
    const newStock = previousStock + delta;
    if (newStock < 0) {
      throw new AppError('Adjustment would result in negative stock quantity.', 400);
    }

    variant.stockQuantity = newStock;
    variant.availableQuantity = Math.max(0, variant.availableQuantity + delta);
    await variant.save();

    // Update master product total stock
    const allVariants = await ProductVariant.find({ productId: variant.productId, isActive: true });
    const totalStock = allVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
    await Product.findByIdAndUpdate(variant.productId, { totalStock });

    // Record ledger transaction
    const transaction = await InventoryTransaction.create({
      variantId: variant._id,
      productId: variant.productId,
      sku: variant.sku,
      type,
      quantityDelta: delta,
      previousStock,
      newStock,
      reason,
      performedBy: new Types.ObjectId(adminUser.id),
      costAtTransaction: variant.costPrice,
    });

    // Audit Log
    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: type,
      module: 'INVENTORY',
      entityId: variantId,
      details: `Adjusted stock for SKU ${variant.sku} by ${delta > 0 ? '+' : ''}${delta}. Reason: ${reason}`,
    });

    return { variant, transaction };
  }

  static async getInventoryLedger(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      InventoryTransaction.find()
        .populate('productId', 'name articleCode')
        .populate('performedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryTransaction.countDocuments(),
    ]);

    return {
      transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // 4. Order Processing & Status Updates
  static async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      filter.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: string,
    note: string,
    adminUser: { id: string; name: string; role: string }
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found.', 404);

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus as any;
    order.statusHistory.push({
      status: newStatus as any,
      timestamp: new Date(),
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      updatedBy: new Types.ObjectId(adminUser.id),
    });

    if (note) {
      order.internalNotes.push({
        note,
        authorId: new Types.ObjectId(adminUser.id),
        createdAt: new Date(),
      });
    }

    await order.save();

    // Audit Log
    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'UPDATE_ORDER_STATUS',
      module: 'ORDERS',
      entityId: orderId,
      details: `Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}. Note: ${note}`,
    });

    return order;
  }

  // 5. Accounting, Expenses & P&L
  static async getExpenses(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (category && category !== 'ALL') {
      filter.category = category;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter).populate('recordedBy', 'firstName lastName').sort({ expenseDate: -1 }).skip(skip).limit(limit).lean(),
      Expense.countDocuments(filter),
    ]);

    const totalAmount = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      expenses,
      totalSum: totalAmount[0]?.total || 0,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createExpense(
    data: {
      category: ExpenseCategoryType;
      description: string;
      amount: number;
      expenseDate?: Date;
      paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'CASH';
      vendorPayee?: string;
      notes?: string;
    },
    adminUser: { id: string; name: string; role: string }
  ) {
    const count = await Expense.countDocuments();
    const expenseCode = `EXP-2026-${String(count + 1).padStart(4, '0')}`;

    const expense = await Expense.create({
      ...data,
      expenseCode,
      recordedBy: new Types.ObjectId(adminUser.id),
      expenseDate: data.expenseDate || new Date(),
    });

    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'RECORD_EXPENSE',
      module: 'ACCOUNTING',
      entityId: expense._id.toString(),
      details: `Recorded expense ${expense.expenseCode} of ₹${expense.amount} under ${expense.category}.`,
    });

    return expense;
  }

  // 6. Vendors & Purchase Orders
  static async getVendors() {
    return Vendor.find().sort({ createdAt: -1 }).lean();
  }

  static async createVendor(data: Record<string, any>, adminUser: { id: string; name: string; role: string }) {
    const vendor = await Vendor.create(data);
    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'CREATE_VENDOR',
      module: 'VENDORS',
      entityId: vendor._id.toString(),
      details: `Added new vendor supplier: ${vendor.vendorName}`,
    });
    return vendor;
  }

  static async createPurchaseOrder(
    data: {
      vendorId: string;
      invoiceNumber: string;
      items: {
        productId: string;
        variantId: string;
        sku: string;
        quantityReceived: number;
        costPricePerUnit: number;
        taxRate?: number;
      }[];
      notes?: string;
    },
    adminUser: { id: string; name: string; role: string }
  ) {
    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = `PO-2026-${String(poCount + 1).padStart(4, '0')}`;

    let totalCost = 0;
    const computedItems = data.items.map((item) => {
      const itemTotal = item.quantityReceived * item.costPricePerUnit;
      totalCost += itemTotal;
      return {
        productId: new Types.ObjectId(item.productId),
        variantId: new Types.ObjectId(item.variantId),
        sku: item.sku,
        quantityReceived: item.quantityReceived,
        costPricePerUnit: item.costPricePerUnit,
        taxRate: item.taxRate || 0,
        totalAmount: itemTotal,
      };
    });

    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      vendorId: new Types.ObjectId(data.vendorId),
      invoiceNumber: data.invoiceNumber,
      items: computedItems,
      totalCost,
      taxAmount: 0,
      grandTotal: totalCost,
      status: 'STOCKED',
      recordedBy: new Types.ObjectId(adminUser.id),
      notes: data.notes,
    });

    // Automatically increase inventory stock for received items
    for (const item of data.items) {
      const variant = await ProductVariant.findById(item.variantId);
      if (variant) {
        const prev = variant.stockQuantity;
        variant.stockQuantity += item.quantityReceived;
        variant.availableQuantity += item.quantityReceived;
        variant.costPrice = item.costPricePerUnit; // update weighted cost
        await variant.save();

        await InventoryTransaction.create({
          variantId: variant._id,
          productId: variant.productId,
          sku: variant.sku,
          type: 'PURCHASE_INWARD',
          quantityDelta: item.quantityReceived,
          previousStock: prev,
          newStock: variant.stockQuantity,
          referenceId: purchaseOrder._id,
          reason: `Stock Inward via Purchase Order ${poNumber} (Invoice: ${data.invoiceNumber})`,
          performedBy: new Types.ObjectId(adminUser.id),
          costAtTransaction: item.costPricePerUnit,
        });
      }
    }

    // Update Vendor Total Purchases
    await Vendor.findByIdAndUpdate(data.vendorId, {
      $inc: { totalPurchased: totalCost },
    });

    await AuditLog.create({
      userId: new Types.ObjectId(adminUser.id),
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'INWARD_PURCHASE_ORDER',
      module: 'PROCUREMENT',
      entityId: purchaseOrder._id.toString(),
      details: `Received & stocked Purchase Order ${poNumber} (Total: ₹${totalCost}).`,
    });

    return purchaseOrder;
  }

  // 7. Customers Directory
  static async getCustomers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({ role: 'customer' }),
    ]);

    const customerIds = customers.map((c) => c._id);
    const customerOrders = await Order.find({
      'customer.userId': { $in: customerIds },
      'paymentInfo.status': PaymentStatus.PAID,
    }).lean();

    const result = customers.map((c) => {
      const orders = customerOrders.filter((o) => o.customer.userId.toString() === c._id.toString());
      const totalSpent = orders.reduce((sum, o) => sum + o.pricing.totalPayable, 0);
      return {
        ...c,
        totalOrdersCount: orders.length,
        lifetimeValue: totalSpent,
      };
    });

    return {
      customers: result,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // 8. Audit Logs
  static async getAuditLogs(page = 1, limit = 40) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);

    return {
      logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
