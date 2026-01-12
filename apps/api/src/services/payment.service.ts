import { eq, and, desc } from 'drizzle-orm';
import type { Database } from '../db';
import {
  payments,
  cvUnlocks,
  cvUnlockPricing,
  maids,
  nationalities,
  users,
} from '../db/schema';
import { StripeService } from './stripe.service';

export interface CvUnlockPrice {
  price: number;
  currency: string;
  nationalityName?: string;
}

export interface PaymentRecord {
  id: string;
  type: 'cv_unlock' | 'subscription' | 'business_subscription';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  amount: string;
  currency: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export class PaymentService {
  constructor(
    private db: Database,
    private stripeService?: StripeService
  ) {}

  // CV Unlock Pricing
  async getCvUnlockPrice(maidId: string): Promise<CvUnlockPrice | null> {
    // Get maid with nationality
    const [maid] = await this.db
      .select({
        maid: maids,
        nationality: nationalities,
      })
      .from(maids)
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id))
      .where(eq(maids.id, maidId))
      .limit(1);

    if (!maid) {
      return null;
    }

    // Try to find nationality-specific pricing
    let pricing = await this.db
      .select()
      .from(cvUnlockPricing)
      .where(
        and(
          eq(cvUnlockPricing.nationalityId, maid.maid.nationalityId),
          eq(cvUnlockPricing.isActive, true)
        )
      )
      .limit(1);

    // Fall back to default pricing (null nationalityId)
    if (pricing.length === 0) {
      pricing = await this.db
        .select()
        .from(cvUnlockPricing)
        .where(
          and(
            eq(cvUnlockPricing.isActive, true)
          )
        )
        .limit(1);
    }

    if (pricing.length === 0) {
      // Return default price if no pricing configured
      return {
        price: 99, // Default 99 AED
        currency: 'AED',
        nationalityName: maid.nationality?.nameEn,
      };
    }

    return {
      price: parseFloat(pricing[0].price),
      currency: pricing[0].currency,
      nationalityName: maid.nationality?.nameEn,
    };
  }

  // Check if user has unlocked a CV
  async hasUnlockedCv(customerId: string, maidId: string): Promise<boolean> {
    const [unlock] = await this.db
      .select()
      .from(cvUnlocks)
      .where(
        and(
          eq(cvUnlocks.customerId, customerId),
          eq(cvUnlocks.maidId, maidId)
        )
      )
      .limit(1);

    return !!unlock;
  }

  // Get all unlocked CVs for a customer
  async getUnlockedCvs(
    customerId: string,
    page = 1,
    pageSize = 20
  ): Promise<{
    items: { maidId: string; unlockedAt: Date }[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    const items = await this.db
      .select({
        maidId: cvUnlocks.maidId,
        unlockedAt: cvUnlocks.unlockedAt,
      })
      .from(cvUnlocks)
      .where(eq(cvUnlocks.customerId, customerId))
      .orderBy(desc(cvUnlocks.unlockedAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const allUnlocks = await this.db
      .select({ maidId: cvUnlocks.maidId })
      .from(cvUnlocks)
      .where(eq(cvUnlocks.customerId, customerId));

    return {
      items,
      total: allUnlocks.length,
      page,
      pageSize,
    };
  }

  // Create payment intent for CV unlock
  async createCvUnlockPaymentIntent(
    customerId: string,
    maidId: string
  ): Promise<{
    clientSecret: string;
    paymentId: string;
    amount: number;
    currency: string;
    customerId?: string;
    customerSessionClientSecret?: string;
  }> {
    if (!this.stripeService) {
      throw new Error('Stripe service not configured');
    }

    // Check if already unlocked
    const alreadyUnlocked = await this.hasUnlockedCv(customerId, maidId);
    if (alreadyUnlocked) {
      throw new Error('CV already unlocked');
    }

    // Get price
    const pricing = await this.getCvUnlockPrice(maidId);
    if (!pricing) {
      throw new Error('Maid not found');
    }

    // Get user info for Stripe customer
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get or create Stripe customer
    const stripeCustomer = await this.stripeService.getOrCreateCustomer({
      userId: customerId,
      email: user.email || undefined,
      phone: user.phone || undefined,
      name: user.name || undefined,
    });

    // Create payment record
    const [payment] = await this.db
      .insert(payments)
      .values({
        userId: customerId,
        type: 'cv_unlock',
        provider: 'stripe',
        status: 'pending',
        amount: pricing.price.toString(),
        currency: pricing.currency,
        metadata: JSON.stringify({ maidId }),
      })
      .returning();

    // Create Stripe payment intent (amount in fils/cents)
    const amountInSmallestUnit = Math.round(pricing.price * 100);
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: amountInSmallestUnit,
      currency: pricing.currency,
      customerId: stripeCustomer.id,
      metadata: {
        paymentId: payment.id,
        customerId,
        maidId,
        type: 'cv_unlock',
      },
      description: `CV Unlock for maid`,
      idempotencyKey: payment.id, // Prevent duplicate charges
    });

    // Create customer session for secure payment sheet
    let customerSessionClientSecret: string | undefined;
    try {
      const customerSession = await this.stripeService.createCustomerSession(stripeCustomer.id);
      customerSessionClientSecret = customerSession.client_secret;
    } catch (error) {
      // CustomerSession is optional - payment sheet works without it
      console.warn('Failed to create customer session:', error);
    }

    // Update payment with Stripe intent ID
    await this.db
      .update(payments)
      .set({
        stripePaymentIntentId: paymentIntent.id,
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: payment.id,
      amount: pricing.price,
      currency: pricing.currency,
      customerId: stripeCustomer.id,
      customerSessionClientSecret,
    };
  }

  // Confirm CV unlock after successful payment
  async confirmCvUnlock(
    paymentId: string,
    stripePaymentIntentId?: string
  ): Promise<boolean> {
    // Get payment record
    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'succeeded') {
      return true; // Already processed
    }

    // Parse metadata
    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const maidId = metadata.maidId;

    if (!maidId) {
      throw new Error('Invalid payment metadata');
    }

    // Update payment status
    await this.db
      .update(payments)
      .set({
        status: 'succeeded',
        stripeChargeId: stripePaymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    // Create CV unlock record
    await this.db.insert(cvUnlocks).values({
      customerId: payment.userId,
      maidId,
      paymentId: payment.id,
    });

    return true;
  }

  // Mark payment as failed
  async markPaymentFailed(paymentId: string, reason?: string): Promise<void> {
    await this.db
      .update(payments)
      .set({
        status: 'failed',
        failureReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));
  }

  // Get payment history
  async getPaymentHistory(
    userId: string,
    page = 1,
    pageSize = 20
  ): Promise<{
    items: PaymentRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;

    const items = await this.db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const allPayments = await this.db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.userId, userId));

    return {
      items: items.map((p) => ({
        id: p.id,
        type: p.type,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        createdAt: p.createdAt,
        metadata: p.metadata ? JSON.parse(p.metadata) : undefined,
      })),
      total: allPayments.length,
      page,
      pageSize,
    };
  }

  // Process Stripe webhook event
  async processStripeWebhook(event: {
    type: string;
    data: {
      object: {
        id: string;
        metadata?: Record<string, string> | null;
        status?: string;
        last_payment_error?: { message?: string };
      };
    };
  }): Promise<void> {
    const { type, data } = event;
    const object = data.object;

    switch (type) {
      case 'payment_intent.succeeded': {
        const paymentId = object.metadata?.paymentId;
        if (paymentId) {
          await this.confirmCvUnlock(paymentId, object.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentId = object.metadata?.paymentId;
        if (paymentId) {
          const errorMessage = object.last_payment_error?.message || 'Payment failed';
          await this.markPaymentFailed(paymentId, errorMessage);
        }
        break;
      }

      // Add more webhook handlers as needed
    }
  }
}
