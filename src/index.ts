import { Hono } from 'hono';
import { authRoute } from './auth/router';
import { env } from 'env.config';
import logger from './utils/logger';
import { userRouter } from './user/router';
import { seedDefaultUser } from './database/defaultSeeds';
import { injectMiddlewares } from './middlewares';
import { dashboardRouter } from './Dashboard/router';
import { errorController } from './errorController';
import { settingsRouter } from './settings/router';

const app = new Hono();

// Apply middlewares
injectMiddlewares(app);
errorController(app)

// Register routes
app.route('/', authRoute);
app.route('/', userRouter);
app.route('/', dashboardRouter)
app.route('/', settingsRouter);

// Start server function
async function startServer() {
    try {
        // Seed default data
        await seedDefaultUser();

        // Start HTTP server
        Bun.serve({
            fetch: app.fetch,
            port: env.PORT,
        });

        logger.success(`🚀 Server started at http://37.60.243.66:${env.PORT}`);
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1); // Exit on failure
    }
}

// Start app
startServer();
