import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { SubscriptionService } from '../services/subscription.service';
import { StripeService } from '../services/stripe.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';

const subscriptionsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Helper to create subscription service
const createSubscriptionService = (db: ReturnType<typeof createDb>, env: Bindings) => {
  let stripeService: StripeService | undefined;

  if (env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    stripeService = new StripeService({
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
    });
  }

  return new SubscriptionService(db, stripeService);
};

// Get all subscription plans (public)
subscriptionsRoute.get('/plans', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const subscriptionService = createSubscriptionService(db, c.env);

    const plans = await subscriptionService.getPlans();

    return c.json({ success: true, data: plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return c.json({ success: false, error: 'Failed to get plans' }, 500);
  }
});

// Get current office subscription
subscriptionsRoute.get(
  '/current',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const subscriptionService = createSubscriptionService(db, c.env);

      const subscription = await subscriptionService.getOfficeSubscription(officeId);

      return c.json({ success: true, data: subscription });
    } catch (error) {
      console.error('Get subscription error:', error);
      return c.json({ success: false, error: 'Failed to get subscription' }, 500);
    }
  }
);

// Check if office can publish more maids
subscriptionsRoute.get(
  '/can-publish',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const subscriptionService = createSubscriptionService(db, c.env);

      const result = await subscriptionService.canPublishMaid(officeId);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Check publish limit error:', error);
      return c.json({ success: false, error: 'Failed to check publish limit' }, 500);
    }
  }
);

// Create/update subscription
subscriptionsRoute.post(
  '/subscribe',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator(
    'json',
    z.object({
      planId: z.string().uuid(),
      billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
    })
  ),
  async (c) => {
    const { planId, billingCycle } = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const subscriptionService = createSubscriptionService(db, c.env);

      const result = await subscriptionService.createSubscription(officeId, planId, billingCycle);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Create subscription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Cancel subscription
subscriptionsRoute.post(
  '/cancel',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const subscriptionService = createSubscriptionService(db, c.env);

      await subscriptionService.cancelSubscription(officeId);

      return c.json({ success: true, message: 'Subscription will be canceled at period end' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Initialize default plans (admin only, run once)
subscriptionsRoute.post(
  '/init-plans',
  authMiddleware,
  requireRole('super_admin'),
  async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const subscriptionService = createSubscriptionService(db, c.env);

      await subscriptionService.initializeDefaultPlans();

      return c.json({ success: true, message: 'Default plans initialized' });
    } catch (error) {
      console.error('Init plans error:', error);
      return c.json({ success: false, error: 'Failed to initialize plans' }, 500);
    }
  }
);

export default subscriptionsRoute;
