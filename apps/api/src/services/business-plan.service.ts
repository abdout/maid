import { eq, and, desc } from 'drizzle-orm';
import type { createDb } from '../db';
import {
  businessPlans,
  customerSubscriptions,
  cvUnlockPricing,
} from '../db/schema';
import { StripeService } from './stripe.service';

type Database = ReturnType<typeof createDb>;

export interface BusinessPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  freeUnlocksPerMonth: number;
  discountPercent: number;
  features: string[] | null;
  isActive: boolean;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  plan: BusinessPlan | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  freeUnlocksUsed: number;
  freeUnlocksResetAt: Date | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

export interface UnlockPriceResult {
  basePrice: number;
  finalPrice: number;
  discountPercent: number;
  canUseFreeUnlock: boolean;
  freeUnlocksRemaining: number;
  currency: string;
}

export class BusinessPlanService {
  constructor(
    private db: Database,
    private stripeService?: StripeService
  ) {}

  // Get all active business plans
  async getPlans(): Promise<BusinessPlan[]> {
    const plans = await this.db.query.businessPlans.findMany({
      where: eq(businessPlans.isActive, true),
      orderBy: [businessPlans.priceMonthly],
    });

    return plans.map((p) => ({
      ...p,
      features: p.features ? JSON.parse(p.features as string) : null,
    }));
  }

  // Get a specific plan by ID
  async getPlanById(planId: string): Promise<BusinessPlan | null> {
    const plan = await this.db.query.businessPlans.findFirst({
      where: eq(businessPlans.id, planId),
    });

    if (!plan) return null;

    return {
      ...plan,
      features: plan.features ? JSON.parse(plan.features as string) : null,
    };
  }

  // Get a plan by tier
  async getPlanByTier(tier: 'free' | 'basic' | 'pro' | 'enterprise'): Promise<BusinessPlan | null> {
    const plan = await this.db.query.businessPlans.findFirst({
      where: and(
        eq(businessPlans.tier, tier),
        eq(businessPlans.isActive, true)
      ),
    });

    if (!plan) return null;

    return {
      ...plan,
      features: plan.features ? JSON.parse(plan.features as string) : null,
    };
  }

  // Get customer's current subscription
  async getCustomerSubscription(customerId: string): Promise<CustomerSubscription | null> {
    const subscription = await this.db.query.customerSubscriptions.findFirst({
      where: eq(customerSubscriptions.customerId, customerId),
      with: {
        plan: true,
      },
      orderBy: [desc(customerSubscriptions.createdAt)],
    });

    if (!subscription) return null;

    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      plan: subscription.plan ? {
        ...subscription.plan,
        features: subscription.plan.features ? JSON.parse(subscription.plan.features as string) : null,
      } : null,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      freeUnlocksUsed: subscription.freeUnlocksUsed,
      freeUnlocksResetAt: subscription.freeUnlocksResetAt,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeCustomerId: subscription.stripeCustomerId,
    };
  }

  // Get unlock price for customer (with plan discount)
  async getUnlockPriceForCustomer(customerId: string, maidId?: string): Promise<UnlockPriceResult> {
    // Get base price (default or nationality-based)
    const defaultPricing = await this.db.query.cvUnlockPricing.findFirst({
      where: eq(cvUnlockPricing.isActive, true),
    });

    const basePrice = defaultPricing ? Number(defaultPricing.price) : 99;
    const currency = defaultPricing?.currency || 'AED';

    // Get customer subscription
    const subscription = await this.getCustomerSubscription(customerId);

    // Default values for free plan
    let discountPercent = 0;
    let freeUnlocksRemaining = 0;
    let canUseFreeUnlock = false;

    if (subscription?.plan && subscription.status === 'active') {
      discountPercent = subscription.plan.discountPercent;
      const freeUnlocksLimit = subscription.plan.freeUnlocksPerMonth;

      // Check if free unlocks need to be reset
      if (subscription.freeUnlocksResetAt) {
        const resetDate = new Date(subscription.freeUnlocksResetAt);
        if (new Date() >= resetDate) {
          // Reset free unlocks (will be done when using an unlock)
          freeUnlocksRemaining = freeUnlocksLimit;
        } else {
          freeUnlocksRemaining = Math.max(0, freeUnlocksLimit - subscription.freeUnlocksUsed);
        }
      } else {
        freeUnlocksRemaining = Math.max(0, freeUnlocksLimit - subscription.freeUnlocksUsed);
      }

      canUseFreeUnlock = freeUnlocksRemaining > 0;
    }

    // Calculate final price
    const finalPrice = canUseFreeUnlock
      ? 0
      : Math.round(basePrice * (1 - discountPercent / 100));

    return {
      basePrice,
      finalPrice,
      discountPercent,
      canUseFreeUnlock,
      freeUnlocksRemaining,
      currency,
    };
  }

  // Use a free CV unlock
  async useFreeUnlock(customerId: string): Promise<boolean> {
    const subscription = await this.getCustomerSubscription(customerId);

    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = subscription.plan;
    if (!plan || plan.freeUnlocksPerMonth <= 0) {
      return false;
    }

    const now = new Date();
    let freeUnlocksUsed = subscription.freeUnlocksUsed;
    let resetAt = subscription.freeUnlocksResetAt;

    // Check if we need to reset the counter
    if (resetAt && now >= new Date(resetAt)) {
      freeUnlocksUsed = 0;
      // Set next reset date to one month from now
      resetAt = new Date();
      resetAt.setMonth(resetAt.getMonth() + 1);
    }

    // Check if there are free unlocks available
    if (freeUnlocksUsed >= plan.freeUnlocksPerMonth) {
      return false;
    }

    // Use a free unlock
    await this.db
      .update(customerSubscriptions)
      .set({
        freeUnlocksUsed: freeUnlocksUsed + 1,
        freeUnlocksResetAt: resetAt || (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          return date;
        })(),
        updatedAt: now,
      })
      .where(eq(customerSubscriptions.id, subscription.id));

    return true;
  }

  // Subscribe customer to a business plan
  async subscribe(
    customerId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ subscriptionId: string; checkoutUrl?: string }> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const existingSubscription = await this.getCustomerSubscription(customerId);

    // For free tier, just create/update subscription directly
    if (plan.tier === 'free') {
      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100);

      if (existingSubscription) {
        await this.db
          .update(customerSubscriptions)
          .set({
            planId,
            status: 'active',
            billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: false,
            freeUnlocksUsed: 0,
            freeUnlocksResetAt: null,
            updatedAt: now,
          })
          .where(eq(customerSubscriptions.id, existingSubscription.id));

        return { subscriptionId: existingSubscription.id };
      }

      const [newSubscription] = await this.db
        .insert(customerSubscriptions)
        .values({
          customerId,
          planId,
          status: 'active',
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: false,
          freeUnlocksUsed: 0,
        })
        .returning();

      return { subscriptionId: newSubscription.id };
    }

    // For paid plans, use Stripe
    if (!this.stripeService) {
      throw new Error('Payment service not configured');
    }

    const priceId = billingCycle === 'yearly'
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new Error('Stripe price not configured for this plan');
    }

    const customer = await this.stripeService.getOrCreateCustomer({
      userId: customerId,
    });

    const session = await this.stripeService.createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${process.env.APP_URL || 'maidapp://'}plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_URL || 'maidapp://'}plans/cancel`,
      metadata: {
        customerId,
        planId,
        billingCycle,
        type: 'business_subscription',
      },
    });

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    const resetAt = new Date();
    resetAt.setMonth(resetAt.getMonth() + 1);

    if (existingSubscription) {
      await this.db
        .update(customerSubscriptions)
        .set({
          planId,
          status: 'trialing',
          billingCycle,
          stripeCustomerId: customer.id,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          freeUnlocksUsed: 0,
          freeUnlocksResetAt: resetAt,
          updatedAt: now,
        })
        .where(eq(customerSubscriptions.id, existingSubscription.id));

      return { subscriptionId: existingSubscription.id, checkoutUrl: session.url || undefined };
    }

    const [newSubscription] = await this.db
      .insert(customerSubscriptions)
      .values({
        customerId,
        planId,
        status: 'trialing',
        billingCycle,
        stripeCustomerId: customer.id,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        freeUnlocksUsed: 0,
        freeUnlocksResetAt: resetAt,
      })
      .returning();

    return { subscriptionId: newSubscription.id, checkoutUrl: session.url || undefined };
  }

  // Cancel subscription
  async cancelSubscription(customerId: string): Promise<void> {
    const subscription = await this.getCustomerSubscription(customerId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (subscription.stripeSubscriptionId && this.stripeService) {
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    await this.db
      .update(customerSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(customerSubscriptions.id, subscription.id));
  }

  // Update subscription status (called by webhook)
  async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: 'active' | 'past_due' | 'canceled' | 'trialing',
    periodEnd?: Date
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (periodEnd) {
      updateData.currentPeriodEnd = periodEnd;
    }

    if (status === 'canceled') {
      updateData.cancelAtPeriodEnd = true;
    }

    await this.db
      .update(customerSubscriptions)
      .set(updateData)
      .where(eq(customerSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
  }

  // Link Stripe subscription after checkout
  async linkStripeSubscription(
    customerId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string
  ): Promise<void> {
    const subscription = await this.getCustomerSubscription(customerId);
    if (!subscription) {
      throw new Error('No subscription found for customer');
    }

    await this.db
      .update(customerSubscriptions)
      .set({
        stripeSubscriptionId,
        stripeCustomerId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(customerSubscriptions.id, subscription.id));
  }

  // Initialize default business plans
  async initializeDefaultPlans(): Promise<void> {
    const existingPlans = await this.db.query.businessPlans.findMany();
    if (existingPlans.length > 0) {
      return;
    }

    const defaultPlans = [
      {
        tier: 'free' as const,
        nameEn: 'Free',
        nameAr: 'مجاني',
        descriptionEn: 'Pay per CV unlock',
        descriptionAr: 'ادفع مقابل كل فتح سيرة ذاتية',
        priceMonthly: 0,
        priceYearly: 0,
        freeUnlocksPerMonth: 0,
        discountPercent: 0,
        features: JSON.stringify(['Pay 99 AED per unlock', 'Basic support']),
        isActive: true,
      },
      {
        tier: 'basic' as const,
        nameEn: 'Basic',
        nameAr: 'أساسي',
        descriptionEn: '10 free unlocks/month + 20% off',
        descriptionAr: '10 فتح مجاني شهرياً + خصم 20%',
        priceMonthly: 149,
        priceYearly: 1490,
        freeUnlocksPerMonth: 10,
        discountPercent: 20,
        features: JSON.stringify([
          '10 free CV unlocks/month',
          '20% off additional unlocks',
          'Priority support',
        ]),
        isActive: true,
      },
      {
        tier: 'pro' as const,
        nameEn: 'Pro',
        nameAr: 'احترافي',
        descriptionEn: '30 free unlocks/month + 40% off',
        descriptionAr: '30 فتح مجاني شهرياً + خصم 40%',
        priceMonthly: 349,
        priceYearly: 3490,
        freeUnlocksPerMonth: 30,
        discountPercent: 40,
        features: JSON.stringify([
          '30 free CV unlocks/month',
          '40% off additional unlocks',
          'Dedicated account manager',
          'Priority support',
        ]),
        isActive: true,
      },
      {
        tier: 'enterprise' as const,
        nameEn: 'Enterprise',
        nameAr: 'مؤسسي',
        descriptionEn: 'Unlimited unlocks + best pricing',
        descriptionAr: 'فتح غير محدود + أفضل الأسعار',
        priceMonthly: 999,
        priceYearly: 9990,
        freeUnlocksPerMonth: 999, // Effectively unlimited
        discountPercent: 50,
        features: JSON.stringify([
          'Unlimited CV unlocks',
          '50% off if exceeded',
          'Dedicated account manager',
          'Custom solutions',
          '24/7 support',
        ]),
        isActive: true,
      },
    ];

    await this.db.insert(businessPlans).values(defaultPlans);
  }
}
