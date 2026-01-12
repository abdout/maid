import { eq, and, desc } from 'drizzle-orm';
import type { createDb } from '../db';
import {
  subscriptionPlans,
  officeSubscriptions,
  maids,
} from '../db/schema';
import { StripeService } from './stripe.service';

type Database = ReturnType<typeof createDb>;

export interface SubscriptionPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  priceMonthly: string;
  priceYearly: string | null;
  maxMaids: number;
  features: string[] | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
}

export interface OfficeSubscription {
  id: string;
  officeId: string;
  planId: string;
  plan: SubscriptionPlan | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

export interface CanPublishResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  plan: string;
  needsUpgrade: boolean;
}

export class SubscriptionService {
  constructor(
    private db: Database,
    private stripeService?: StripeService
  ) {}

  // Get all active subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const plans = await this.db.query.subscriptionPlans.findMany({
      where: eq(subscriptionPlans.isActive, true),
      orderBy: [subscriptionPlans.priceMonthly],
    });

    return plans.map((p) => ({
      ...p,
      features: p.features as string[] | null,
    }));
  }

  // Get a specific plan by ID
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    const plan = await this.db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.id, planId),
    });

    if (!plan) return null;

    return {
      ...plan,
      features: plan.features as string[] | null,
    };
  }

  // Get a plan by tier
  async getPlanByTier(tier: 'free' | 'basic' | 'pro' | 'enterprise'): Promise<SubscriptionPlan | null> {
    const plan = await this.db.query.subscriptionPlans.findFirst({
      where: and(
        eq(subscriptionPlans.tier, tier),
        eq(subscriptionPlans.isActive, true)
      ),
    });

    if (!plan) return null;

    return {
      ...plan,
      features: plan.features as string[] | null,
    };
  }

  // Get office's current subscription
  async getOfficeSubscription(officeId: string): Promise<OfficeSubscription | null> {
    const subscription = await this.db.query.officeSubscriptions.findFirst({
      where: eq(officeSubscriptions.officeId, officeId),
      with: {
        plan: true,
      },
      orderBy: [desc(officeSubscriptions.createdAt)],
    });

    if (!subscription) return null;

    return {
      id: subscription.id,
      officeId: subscription.officeId,
      planId: subscription.planId,
      plan: subscription.plan ? {
        ...subscription.plan,
        features: subscription.plan.features as string[] | null,
      } : null,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeCustomerId: subscription.stripeCustomerId,
    };
  }

  // Check if office can publish more maids
  async canPublishMaid(officeId: string): Promise<CanPublishResult> {
    // Get current subscription
    const subscription = await this.getOfficeSubscription(officeId);

    // Default to free tier if no subscription
    let limit = 3; // Free tier default
    let planName = 'Free';

    if (subscription?.plan) {
      limit = subscription.plan.maxMaids;
      planName = subscription.plan.nameEn;

      // Check if subscription is active
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        // Expired subscription, fall back to free tier
        const freePlan = await this.getPlanByTier('free');
        limit = freePlan?.maxMaids || 3;
        planName = 'Free (subscription expired)';
      }
    }

    // Count current published maids
    const publishedMaids = await this.db.query.maids.findMany({
      where: and(
        eq(maids.officeId, officeId),
        eq(maids.status, 'available')
      ),
      columns: { id: true },
    });

    const currentCount = publishedMaids.length;

    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      plan: planName,
      needsUpgrade: currentCount >= limit,
    };
  }

  // Create or update subscription for office
  async createSubscription(
    officeId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ subscriptionId: string; checkoutUrl?: string }> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if office already has a subscription
    const existingSubscription = await this.getOfficeSubscription(officeId);

    // For free tier, just create the subscription directly
    if (plan.tier === 'free') {
      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // Far future for free tier

      if (existingSubscription) {
        // Update existing subscription
        await this.db
          .update(officeSubscriptions)
          .set({
            planId,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: false,
            updatedAt: now,
          })
          .where(eq(officeSubscriptions.id, existingSubscription.id));

        return { subscriptionId: existingSubscription.id };
      }

      // Create new subscription
      const [newSubscription] = await this.db
        .insert(officeSubscriptions)
        .values({
          officeId,
          planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: false,
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

    // Get or create Stripe customer
    const customer = await this.stripeService.getOrCreateCustomer({
      userId: officeId,
    });

    // Create Stripe checkout session
    const session = await this.stripeService.createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${process.env.APP_URL || 'https://maid.ae'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_URL || 'https://maid.ae'}/subscription/cancel`,
      metadata: {
        officeId,
        planId,
        billingCycle,
      },
    });

    // Create pending subscription record
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    if (existingSubscription) {
      await this.db
        .update(officeSubscriptions)
        .set({
          planId,
          status: 'trialing', // Will be updated by webhook
          stripeCustomerId: customer.id,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .where(eq(officeSubscriptions.id, existingSubscription.id));

      return { subscriptionId: existingSubscription.id, checkoutUrl: session.url || undefined };
    }

    const [newSubscription] = await this.db
      .insert(officeSubscriptions)
      .values({
        officeId,
        planId,
        status: 'trialing',
        stripeCustomerId: customer.id,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      })
      .returning();

    return { subscriptionId: newSubscription.id, checkoutUrl: session.url || undefined };
  }

  // Cancel subscription at period end
  async cancelSubscription(officeId: string): Promise<void> {
    const subscription = await this.getOfficeSubscription(officeId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // If Stripe subscription, cancel there first
    if (subscription.stripeSubscriptionId && this.stripeService) {
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    await this.db
      .update(officeSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(officeSubscriptions.id, subscription.id));
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
      .update(officeSubscriptions)
      .set(updateData)
      .where(eq(officeSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
  }

  // Link Stripe subscription ID after successful checkout
  async linkStripeSubscription(
    officeId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string
  ): Promise<void> {
    const subscription = await this.getOfficeSubscription(officeId);
    if (!subscription) {
      throw new Error('No subscription found for office');
    }

    await this.db
      .update(officeSubscriptions)
      .set({
        stripeSubscriptionId,
        stripeCustomerId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(officeSubscriptions.id, subscription.id));
  }

  // Initialize default plans (run once during setup)
  async initializeDefaultPlans(): Promise<void> {
    const existingPlans = await this.db.query.subscriptionPlans.findMany();
    if (existingPlans.length > 0) {
      return; // Plans already exist
    }

    const defaultPlans = [
      {
        tier: 'free' as const,
        nameEn: 'Free',
        nameAr: 'مجاني',
        descriptionEn: 'Get started with basic features',
        descriptionAr: 'ابدأ مع الميزات الأساسية',
        priceMonthly: '0',
        priceYearly: '0',
        maxMaids: 3,
        features: JSON.stringify(['Up to 3 maid listings', 'Basic support', 'Standard visibility']),
        isActive: true,
      },
      {
        tier: 'basic' as const,
        nameEn: 'Basic',
        nameAr: 'أساسي',
        descriptionEn: 'Perfect for small offices',
        descriptionAr: 'مثالي للمكاتب الصغيرة',
        priceMonthly: '199',
        priceYearly: '1990',
        maxMaids: 15,
        features: JSON.stringify(['Up to 15 maid listings', 'Priority support', 'Enhanced visibility', 'Analytics dashboard']),
        isActive: true,
      },
      {
        tier: 'pro' as const,
        nameEn: 'Professional',
        nameAr: 'احترافي',
        descriptionEn: 'For growing businesses',
        descriptionAr: 'للأعمال النامية',
        priceMonthly: '499',
        priceYearly: '4990',
        maxMaids: 50,
        features: JSON.stringify(['Up to 50 maid listings', 'Premium support', 'Top visibility', 'Advanced analytics', 'Featured listings']),
        isActive: true,
      },
      {
        tier: 'enterprise' as const,
        nameEn: 'Enterprise',
        nameAr: 'مؤسسي',
        descriptionEn: 'Unlimited for large agencies',
        descriptionAr: 'غير محدود للوكالات الكبيرة',
        priceMonthly: '999',
        priceYearly: '9990',
        maxMaids: 999,
        features: JSON.stringify(['Unlimited maid listings', 'Dedicated support', 'Maximum visibility', 'Custom analytics', 'API access']),
        isActive: true,
      },
    ];

    await this.db.insert(subscriptionPlans).values(defaultPlans);
  }
}
