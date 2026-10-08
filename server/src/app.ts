import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { errorHandler, AppError } from './middlewares/errorHandler.js';

// Import Domain Routers
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import checkoutRoutes from './modules/checkout/checkout.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import contentRoutes from './modules/content/content.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security & Utility Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible media hosting in development
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  if (ENV.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      brand: 'The Femina Exclusive',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
    });
  });

  // Mount API Domain Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/checkout', checkoutRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/store', contentRoutes);

  // 404 Route Catch-all
  app.use('*', (req: Request, res: Response, next) => {
    next(new AppError(`API endpoint '${req.originalUrl}' not found.`, 404, 'ROUTE_NOT_FOUND'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
