import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { BusinessPlanService } from '../services/business-plan.service';
import { StripeService } from '../services/stripe.service';
import { authMiddleware, requireRole } from '../middleware';

const businessPlansRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Helper to create business plan service
const createBusinessPlanService = (db: ReturnType<typeof createDb>, env: Bindings) => {
  let stripeService: StripeService | undefined;

  if (env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    stripeService = new StripeService({
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
    });
  }

  return new BusinessPlanService(db, stripeService);
};

// Get all business plans (public)
businessPlansRoute.get('/', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const businessPlanService = createBusinessPlanService(db, c.env);

    const plans = await businessPlanService.getPlans();

    return c.json({ success: true, data: plans });
  } catch (error) {
    console.error('Get business plans error:', error);
    return c.json({ success: false, error: 'Failed to get business plans' }, 500);
  }
});

// Get current customer subscription
businessPlansRoute.get(
  '/subscription',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    const user = c.get('user')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      const subscription = await businessPlanService.getCustomerSubscription(user.sub);

      return c.json({ success: true, data: subscription });
    } catch (error) {
      console.error('Get subscription error:', error);
      return c.json({ success: false, error: 'Failed to get subscription' }, 500);
    }
  }
);

// Get unlock price for a maid (with plan discount applied)
businessPlansRoute.get(
  '/unlock-price/:maidId',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    const user = c.get('user')!;
    const maidId = c.req.param('maidId');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      const priceInfo = await businessPlanService.getUnlockPriceForCustomer(user.sub, maidId);

      return c.json({ success: true, data: priceInfo });
    } catch (error) {
      console.error('Get unlock price error:', error);
      return c.json({ success: false, error: 'Failed to get unlock price' }, 500);
    }
  }
);

// Subscribe to a business plan
businessPlansRoute.post(
  '/subscribe',
  authMiddleware,
  requireRole('customer'),
  zValidator(
    'json',
    z.object({
      planId: z.string().uuid(),
      billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
    })
  ),
  async (c) => {
    const { planId, billingCycle } = c.req.valid('json');
    const user = c.get('user')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      const result = await businessPlanService.subscribe(user.sub, planId, billingCycle);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Subscribe error:', error);
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Cancel subscription
businessPlansRoute.post(
  '/cancel',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    const user = c.get('user')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      await businessPlanService.cancelSubscription(user.sub);

      return c.json({ success: true, message: 'Subscription will be canceled at period end' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Use a free CV unlock
businessPlansRoute.post(
  '/use-free-unlock',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    const user = c.get('user')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      const success = await businessPlanService.useFreeUnlock(user.sub);

      if (!success) {
        return c.json({ success: false, error: 'No free unlocks available' }, 400);
      }

      return c.json({ success: true, message: 'Free unlock used successfully' });
    } catch (error) {
      console.error('Use free unlock error:', error);
      return c.json({ success: false, error: 'Failed to use free unlock' }, 500);
    }
  }
);

// Initialize default business plans (admin only, run once)
businessPlansRoute.post(
  '/init-plans',
  authMiddleware,
  requireRole('super_admin'),
  async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessPlanService = createBusinessPlanService(db, c.env);

      await businessPlanService.initializeDefaultPlans();

      return c.json({ success: true, message: 'Default business plans initialized' });
    } catch (error) {
      console.error('Init business plans error:', error);
      return c.json({ success: false, error: 'Failed to initialize business plans' }, 500);
    }
  }
);

export default businessPlansRoute;
