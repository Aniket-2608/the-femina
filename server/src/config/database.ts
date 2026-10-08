import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // Don't kill process immediately in dev so app can start with graceful status
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};
