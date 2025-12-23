import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { PaymentService } from '../services/payment.service';
import { StripeService } from '../services/stripe.service';
import { TabbyService } from '../services/tabby.service';
import { authMiddleware } from '../middleware';
import { payments, cvUnlocks, maids, nationalities } from '../db/schema';
import { eq } from 'drizzle-orm';

const paymentsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Helper to create payment service with optional Stripe
const createPaymentService = (db: ReturnType<typeof createDb>, env: Bindings) => {
  let stripeService: StripeService | undefined;

  if (env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    stripeService = new StripeService({
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
    });
  }

  return new PaymentService(db, stripeService);
};

// Helper to create Tabby service
const createTabbyService = (env: Bindings): TabbyService | undefined => {
  if (env.TABBY_SECRET_KEY && env.TABBY_PUBLIC_KEY && env.TABBY_MERCHANT_CODE) {
    return new TabbyService({
      secretKey: env.TABBY_SECRET_KEY,
      publicKey: env.TABBY_PUBLIC_KEY,
      merchantCode: env.TABBY_MERCHANT_CODE,
    });
  }
  return undefined;
};

// Get CV unlock price for a maid
paymentsRoute.get(
  '/cv-unlock/price/:maidId',
  authMiddleware,
  async (c) => {
    const maidId = c.req.param('maidId');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const pricing = await paymentService.getCvUnlockPrice(maidId);

      if (!pricing) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      return c.json({ success: true, data: pricing });
    } catch (error) {
      console.error('Get CV unlock price error:', error);
      return c.json({ success: false, error: 'Failed to get price' }, 500);
    }
  }
);

// Check if user has unlocked a CV
paymentsRoute.get(
  '/cv-unlock/check/:maidId',
  authMiddleware,
  async (c) => {
    const maidId = c.req.param('maidId');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const isUnlocked = await paymentService.hasUnlockedCv(user.sub, maidId);

      return c.json({ success: true, data: { isUnlocked } });
    } catch (error) {
      console.error('Check CV unlock error:', error);
      return c.json({ success: false, error: 'Failed to check unlock status' }, 500);
    }
  }
);

// Create payment intent for CV unlock
paymentsRoute.post(
  '/cv-unlock/create-intent',
  authMiddleware,
  zValidator(
    'json',
    z.object({
      maidId: z.string().uuid(),
    })
  ),
  async (c) => {
    const { maidId } = c.req.valid('json');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const result = await paymentService.createCvUnlockPaymentIntent(user.sub, maidId);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Create payment intent error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create payment';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Confirm CV unlock after successful payment (client-side confirmation)
paymentsRoute.post(
  '/cv-unlock/confirm',
  authMiddleware,
  zValidator(
    'json',
    z.object({
      paymentId: z.string().uuid(),
      stripePaymentIntentId: z.string().optional(),
    })
  ),
  async (c) => {
    const { paymentId, stripePaymentIntentId } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const success = await paymentService.confirmCvUnlock(paymentId, stripePaymentIntentId);

      return c.json({ success: true, data: { confirmed: success } });
    } catch (error) {
      console.error('Confirm CV unlock error:', error);
      const message = error instanceof Error ? error.message : 'Failed to confirm payment';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Get user's unlocked CVs
paymentsRoute.get(
  '/unlocked',
  authMiddleware,
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
    })
  ),
  async (c) => {
    const { page, pageSize } = c.req.valid('query');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const result = await paymentService.getUnlockedCvs(user.sub, page, pageSize);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Get unlocked CVs error:', error);
      return c.json({ success: false, error: 'Failed to get unlocked CVs' }, 500);
    }
  }
);

// Get payment history
paymentsRoute.get(
  '/history',
  authMiddleware,
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
    })
  ),
  async (c) => {
    const { page, pageSize } = c.req.valid('query');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      const result = await paymentService.getPaymentHistory(user.sub, page, pageSize);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Get payment history error:', error);
      return c.json({ success: false, error: 'Failed to get payment history' }, 500);
    }
  }
);

// ============ TABBY ENDPOINTS ============

// Create Tabby checkout for CV unlock
paymentsRoute.post(
  '/cv-unlock/tabby/create',
  authMiddleware,
  zValidator(
    'json',
    z.object({
      maidId: z.string().uuid(),
    })
  ),
  async (c) => {
    const { maidId } = c.req.valid('json');
    const user = c.get('user');

    try {
      const tabbyService = createTabbyService(c.env);
      if (!tabbyService) {
        return c.json({ success: false, error: 'Tabby not configured' }, 400);
      }

      const db = createDb(c.env.DATABASE_URL);
      const paymentService = createPaymentService(db, c.env);

      // Check if already unlocked
      const isUnlocked = await paymentService.hasUnlockedCv(user.sub, maidId);
      if (isUnlocked) {
        return c.json({ success: false, error: 'CV already unlocked' }, 400);
      }

      // Get pricing and maid info
      const pricing = await paymentService.getCvUnlockPrice(maidId);
      if (!pricing) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      // Get maid details for order
      const maid = await db.query.maids.findFirst({
        where: eq(maids.id, maidId),
        with: { nationality: true },
      });

      if (!maid) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      // Create payment record
      const [payment] = await db
        .insert(payments)
        .values({
          userId: user.sub,
          maidId,
          type: 'cv_unlock',
          provider: 'tabby',
          amount: pricing.price.toString(),
          currency: pricing.currency,
          status: 'pending',
        })
        .returning();

      // Create Tabby checkout
      const appUrl = process.env.APP_URL || 'https://maid.ae';
      const session = await tabbyService.createCheckout({
        amount: TabbyService.formatAmount(pricing.price),
        currency: pricing.currency,
        buyer: {
          phone: user.phone || '',
          email: user.email || undefined,
        },
        order: {
          referenceId: payment.id,
          items: [
            {
              title: `CV Unlock - ${maid.name}`,
              description: maid.nationality?.nameEn || 'Maid CV',
              quantity: 1,
              unitPrice: TabbyService.formatAmount(pricing.price),
              category: 'Digital Services',
              referenceId: maidId,
            },
          ],
          shippingAmount: '0.00',
          taxAmount: '0.00',
          discount: '0.00',
        },
        description: `Unlock CV for ${maid.name}`,
        merchantUrls: {
          success: `${appUrl}/payment/success?payment_id=${payment.id}`,
          cancel: `${appUrl}/payment/cancel?payment_id=${payment.id}`,
          failure: `${appUrl}/payment/failure?payment_id=${payment.id}`,
        },
        metadata: {
          paymentId: payment.id,
          maidId,
          customerId: user.sub,
        },
      });

      const checkoutUrl = tabbyService.getCheckoutUrl(session);

      // Update payment with Tabby session ID
      await db
        .update(payments)
        .set({
          providerPaymentId: session.id,
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      return c.json({
        success: true,
        data: {
          paymentId: payment.id,
          sessionId: session.id,
          checkoutUrl,
          amount: pricing.price,
          currency: pricing.currency,
          installments: session.configuration?.availableProducts?.installments?.[0]?.installments || [],
        },
      });
    } catch (error) {
      console.error('Create Tabby checkout error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create Tabby checkout';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Confirm Tabby payment after successful checkout
paymentsRoute.post(
  '/cv-unlock/tabby/confirm',
  authMiddleware,
  zValidator(
    'json',
    z.object({
      paymentId: z.string().uuid(),
      tabbyPaymentId: z.string(),
    })
  ),
  async (c) => {
    const { paymentId, tabbyPaymentId } = c.req.valid('json');
    const user = c.get('user');

    try {
      const tabbyService = createTabbyService(c.env);
      if (!tabbyService) {
        return c.json({ success: false, error: 'Tabby not configured' }, 400);
      }

      const db = createDb(c.env.DATABASE_URL);

      // Get payment record
      const payment = await db.query.payments.findFirst({
        where: eq(payments.id, paymentId),
      });

      if (!payment) {
        return c.json({ success: false, error: 'Payment not found' }, 404);
      }

      if (payment.userId !== user.sub) {
        return c.json({ success: false, error: 'Unauthorized' }, 403);
      }

      if (payment.status === 'succeeded') {
        return c.json({ success: true, data: { alreadyConfirmed: true } });
      }

      // Verify with Tabby
      const tabbyPayment = await tabbyService.getPayment(tabbyPaymentId);

      if (tabbyPayment.status !== 'authorized' && tabbyPayment.status !== 'captured') {
        return c.json({ success: false, error: 'Payment not authorized' }, 400);
      }

      // Capture if needed
      if (tabbyPayment.status === 'authorized') {
        await tabbyService.capturePayment(tabbyPaymentId);
      }

      // Update payment status
      await db
        .update(payments)
        .set({
          status: 'succeeded',
          providerPaymentId: tabbyPaymentId,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // Create CV unlock record
      await db.insert(cvUnlocks).values({
        customerId: user.sub,
        maidId: payment.maidId!,
        paymentId,
      });

      return c.json({ success: true, data: { confirmed: true } });
    } catch (error) {
      console.error('Confirm Tabby payment error:', error);
      const message = error instanceof Error ? error.message : 'Failed to confirm payment';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

export default paymentsRoute;
