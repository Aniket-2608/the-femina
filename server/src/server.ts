import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      console.log(`\n=============================================================`);
      console.log(`✨ The Femina Exclusive API Server running on port ${ENV.PORT} ✨`);
      console.log(`   🔗 Environment: ${ENV.NODE_ENV}`);
      console.log(`   🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`   🔗 Client URL: ${ENV.CLIENT_URL}`);
      console.log(`=============================================================\n`);
    });

    const handleGracefulShutdown = (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
