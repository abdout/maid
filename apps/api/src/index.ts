import { Hono } from 'hono';
import type { Bindings, Variables } from './types';

// Import routes
import auth from './routes/auth';
import oauth from './routes/oauth';
import health from './routes/health';
import maids from './routes/maids';
import offices from './routes/offices';
import quotations from './routes/quotations';
import uploads from './routes/uploads';
import lookups from './routes/lookups';
import favorites from './routes/favorites';
import payments from './routes/payments';
import subscriptions from './routes/subscriptions';
import businessPlans from './routes/business-plans';
import webhooks from './routes/webhooks';
import admin from './routes/admin';
import notifications from './routes/notifications';
import users from './routes/users';
import wallet from './routes/wallet';

// Import middleware
import {
  requestLogger,
  errorLogger,
  serverTiming,
  corsMiddleware,
} from './middleware/logger';
import { standardRateLimit } from './middleware/rate-limit';

// Create Hono app with typed bindings and variables
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global middleware - applied to all routes
app.use('*', errorLogger);
app.use('*', requestLogger);
app.use('*', serverTiming);
app.use(
  '*',
  corsMiddleware([
    'http://localhost:8081',
    'http://localhost:19006',
    'https://maid.ae',
    'https://*.maid.ae',
    'https://*.vercel.app',
    'https://*.trycloudflare.com',
  ])
);

// Apply standard rate limiting to API routes (not health check or webhooks)
app.use('/auth/*', standardRateLimit);
app.use('/oauth/*', standardRateLimit);
app.use('/maids/*', standardRateLimit);
app.use('/offices/*', standardRateLimit);
app.use('/quotations/*', standardRateLimit);
app.use('/uploads/*', standardRateLimit);
app.use('/lookups/*', standardRateLimit);
app.use('/favorites/*', standardRateLimit);
app.use('/payments/*', standardRateLimit);
app.use('/subscriptions/*', standardRateLimit);
app.use('/business-plans/*', standardRateLimit);
app.use('/admin/*', standardRateLimit);
app.use('/notifications/*', standardRateLimit);
app.use('/users/*', standardRateLimit);
app.use('/wallet/*', standardRateLimit);

// API Routes
app.route('/health', health);
app.route('/auth', auth);
app.route('/oauth', oauth);
app.route('/maids', maids);
app.route('/offices', offices);
app.route('/quotations', quotations);
app.route('/uploads', uploads);
app.route('/lookups', lookups);
app.route('/favorites', favorites);
app.route('/payments', payments);
app.route('/subscriptions', subscriptions);
app.route('/business-plans', businessPlans);
app.route('/webhooks', webhooks);
app.route('/admin', admin);
app.route('/notifications', notifications);
app.route('/users', users);
app.route('/wallet', wallet);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'Maid UAE API',
    version: '0.1.0',
    environment: c.env.ENVIRONMENT,
    endpoints: {
      health: '/health',
      auth: '/auth',
      oauth: '/oauth',
      maids: '/maids',
      offices: '/offices',
      quotations: '/quotations',
      uploads: '/uploads',
      lookups: '/lookups',
      favorites: '/favorites',
      payments: '/payments',
      subscriptions: '/subscriptions',
      businessPlans: '/business-plans',
      webhooks: '/webhooks',
      admin: '/admin',
      users: '/users',
      wallet: '/wallet',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      success: false,
      error: c.env.ENVIRONMENT === 'production' ? 'Internal Server Error' : err.message,
    },
    500
  );
});

// Export for RPC client type inference
export type AppType = typeof app;

export default app;
